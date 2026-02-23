import {
    useSearchBranchesByArea,
    getFindNearestBranchesQueryOptions,
    searchBranchesByArea,
    findNearestBranches,
} from "~/api/branch-locator/generated/endpoints/branch-location/branch-location";
import  {
    type Dispatch,
    type SubmitEvent,
    type RefObject,
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    type MouseEvent
} from "react";
import { useQueryClient, type QueryClient, type UseQueryResult } from "@tanstack/react-query";
import { createZodResolver } from "~/model/auth/zod/ZodResolver";
import type { TypeError } from "~/domain/error/Error";
import type {
    BranchLocation,
    BranchSearchResponse, ErrorResponse, FindNearestBranchesParams,
    SearchBranchesByAreaParams
} from "~/domain/branch-locator/generated/model";
import {
    BranchLocatorSchema,
    type BranchLocatorState,
    type BranchParams,
    type BranchResponse,
    DEFAULT_BRANCH_PAGE_LIMIT
} from "~/domain/branch-locator/BranchLocator";
import { ViewModel } from "~/model/ViewModel";
import { type ActionDispatch, ActionEvent } from "~/model/ActionEvent";
import type { QueryObserverResult } from "@tanstack/query-core";
import { BRANCH_CACHE_CONFIG, getLastCachedBranchData } from "~/lib/react-query/Client";
import type { PaginationMeta } from "~/domain/State";

type Resolver = (data: BranchParams) => Promise<{
    values?: BranchParams;
    errors?: TypeError<BranchParams>;
}>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createBranchResolver = (): any => createZodResolver<BranchParams, TypeError<BranchParams>>(BranchLocatorSchema);

const SearchInitialState: BranchLocatorState = {
    DISTANCES: [5, 10, 25, 35],
    searchType: "latLong",
    items: [],
    pagination: null,
    errors: {
        searchText: {
            isError: false,
            message: ""
        },
        offset: { isError: false },
        limit: { isError: false },
        response: {
            isError: false,
            message: ''
        }
    } as TypeError<BranchParams>,
    isLoading: false,
    userData: {
        searchText: "",
        maxDistanceKm: 10,
        limit: DEFAULT_BRANCH_PAGE_LIMIT,
        offset: 0,
    } as BranchParams
};

/** Extract branches from API response */
const extractBranches = (response: BranchResponse): BranchLocation[] => response.branches || [];

/** Extract pagination from API response */
const extractPagination = (response: BranchResponse): PaginationMeta | null => response.pagination || null;

/** Create reducer using base paginatedReducer */
const branchLocatorReducer = ViewModel.paginatedReducer<
    BranchParams,
    BranchResponse,
    BranchLocation,
    BranchLocatorState
>(
    SearchInitialState,
    extractBranches,
    extractPagination
);

export const useBranchLocatorModelView = () => {
    const queryClient = useQueryClient();
    const [state, dispatch] = useReducer(branchLocatorReducer, SearchInitialState);

    const stateRef = useRef(state);
    stateRef.current = state;

    const coordinates = useRef<FindNearestBranchesParams | null>(null);

    const fetchCoordinates = useCallback(async (): Promise<FindNearestBranchesParams | null> => {
        try {
            const data = await BranchLocatorModelView.getLatLong();
            const userData = state.userData as FindNearestBranchesParams;

            coordinates.current = {
                latitude: data.lat,
                longitude: data.lng,
                limit: userData.limit ?? DEFAULT_BRANCH_PAGE_LIMIT,
                maxDistanceKm: userData.maxDistanceKm ?? 5,
            };

            return coordinates.current;
        } catch (err) {
            dispatch({
                type: ActionEvent.SET_API_ERROR,
                error: {
                    isError: true,
                    message: (err as Error)?.message || "Failed to get location. Please enable location and try again.",
                }
            });
            return null;
        }
    }, [state.userData]);

    useEffect(() => {
        let permissionStatus: PermissionStatus | null = null;

        fetchCoordinates();

        navigator.permissions.query({ name: "geolocation" })
            .then(status => {
                permissionStatus = status;
                status.onchange = () => {
                    if (status.state === "granted") {
                        fetchCoordinates();
                    }
                };
            });

        return () => {
            if (permissionStatus) {
                permissionStatus.onchange = null;
            }
        };
    }, []);

    const areaQuery = useSearchBranchesByArea(
        state.userData as SearchBranchesByAreaParams,
        {
            query: {
                enabled: false,
                staleTime: BRANCH_CACHE_CONFIG.staleTime,
                gcTime: BRANCH_CACHE_CONFIG.gcTime,
            }
        }
    );

    // Check for cached data on mount and populate state
    useEffect(() => {
        // Don't overwrite if we already have data
        if (state.response?.data) return;

        // Get the most recent cached branch data
        const cachedData = getLastCachedBranchData();
        if (cachedData?.data) {
            dispatch({
                type: ActionEvent.SET_API_RESPONSE_SUCCESS,
                isSuccess: true,
                message: "Loaded from cache",
                data: cachedData.data
            });
        }
    }, []); // Only run on mount

    const resolver = useMemo(() => createBranchResolver(), []);

    const model = useMemo(
        () => new BranchLocatorModelView(
            stateRef,
            dispatch,
            resolver,
            areaQuery,
            coordinates,
            fetchCoordinates,
            queryClient
        ),
        [resolver, areaQuery, fetchCoordinates, queryClient]
    );

    // Get branches from state (already handled by paginated reducer)
    const branches = state.items;

    return { state, model, branches };
};

export class BranchLocatorModelView extends ViewModel<BranchParams, BranchResponse, BranchLocatorState> {

    private static GEOLOCATION_TIME_OUT = 5000;
    private static GEOLOCATION_AGE = 0;

    constructor(
        protected stateRef: RefObject<BranchLocatorState>,
        protected dispatch: Dispatch<ActionDispatch<BranchParams, BranchResponse>>,
        protected resolver: Resolver,
        private areaQuery: UseQueryResult<BranchSearchResponse, ErrorResponse> & { queryKey: readonly unknown[] },
        private coordinates: RefObject<FindNearestBranchesParams | null>,
        private fetchCoordinateFn: () => Promise<FindNearestBranchesParams | null>,
        private queryClient: QueryClient
    ) {
        super(stateRef.current!, dispatch, resolver, SearchInitialState);
    }

    private get currentState(): BranchLocatorState {
        return this.stateRef.current!;
    }

    /** Check if there are more branches to load */
    get hasMore(): boolean {
        return this.currentState.pagination?.hasNext ?? false;
    }

    /** Load more branches (next page) */
    loadMoreBranches = async (): Promise<void> => {
        const { pagination, userData, isLoading, searchType } = this.currentState;

        // Don't load if already loading or no more pages
        if (isLoading || !pagination?.hasNext) {
            return;
        }

        // Update offset first
        const nextOffset = userData.offset + userData.limit;
        this.dispatch({ type: ActionEvent.SET_FIELD, field: "offset", value: nextOffset });
        this.dispatch({ type: ActionEvent.SET_LOADING, isLoading: true });

        try {
            let response: BranchResponse;

            if (searchType === "area") {
                const searchParams = userData as SearchBranchesByAreaParams;
                response = await searchBranchesByArea({
                    searchText: searchParams.searchText,
                    offset: nextOffset,
                    limit: userData.limit,
                });
            } else {
                const coords = this.coordinates.current;
                if (!coords) {
                    throw new Error("Coordinates not available");
                }
                response = await findNearestBranches({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    maxDistanceKm: (userData as FindNearestBranchesParams).maxDistanceKm,
                    offset: nextOffset,
                    limit: userData.limit,
                });
            }

            this.dispatch({
                type: ActionEvent.SET_API_RESPONSE_SUCCESS,
                message: "Loaded more branches",
                data: response,
            });
        } catch (error) {
            const errorMessage = (error as Error)?.message || "Failed to load more branches";
            this.dispatch({
                type: ActionEvent.SET_API_ERROR,
                error: { isError: true, message: errorMessage },
            });
        }
    };

    public static async getLatLong(): Promise<{ lat: number; lng: number }> {
        const coords = await this.getNearByBranchesByLatLong();

        if (coords.lng === undefined || coords.lng === null) {
            throw new Error("Failed to get your current location, please enable location and try again");
        }

        return coords;
    }

    public static getNearByBranchesByLatLong = (): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser"));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: this.GEOLOCATION_TIME_OUT,
                    maximumAge: this.GEOLOCATION_AGE,
                }
            );
        });
    };

    onFilterEvent = async (id: string, event: MouseEvent<HTMLButtonElement>, value?: number) => {
        event.preventDefault();
        const field = id as keyof BranchParams;
        this.clearTimeout();
        this.dispatch({ type: ActionEvent.SET_FIELD, field: field, value: value });
    };

    catchStateChange(_state: BranchLocatorState): void {}

    submitToAPI = async () => {
        const searchParams = this.currentState.userData as SearchBranchesByAreaParams;

        // Skip if no search text
        if (!searchParams.searchText?.trim()) {
            this.dispatch({
                type: ActionEvent.SET_API_ERROR,
                error: {
                    isError: true,
                    message: "Please enter a search term"
                }
            });
            return;
        }

        // Reset offset for new search
        this.dispatch({ type: ActionEvent.SET_FIELD, field: "offset", value: 0 });

        this.areaQuery.refetch().then((result) => {
            // Check loading states
            if (result.isLoading || result.isFetching || result.isPaused) {
                this.dispatch({ type: ActionEvent.SET_LOADING, isLoading: true });
                return;
            }

            if (result.isError) {
                this.dispatch({
                    type: ActionEvent.SET_API_ERROR,
                    error: {
                        isError: true,
                        message: (result.error as ErrorResponse)?.message || "Search failed"
                    }
                });
                return;
            }

            const data = result.data;
            if (!data || data.branches.length === 0) {
                this.dispatch({
                    type: ActionEvent.SET_API_ERROR,
                    error: {
                        message: `No branches found for "${searchParams.searchText}"`,
                        isError: true
                    }
                });
            } else {
                this.dispatch({
                    type: ActionEvent.SET_API_RESPONSE_SUCCESS,
                    isSuccess: true,
                    message: "Search completed",
                    data
                });
            }
        }).catch((error) => {
            this.dispatch({
                type: ActionEvent.SET_API_ERROR,
                error: {
                    isError: true,
                    message: (error as ErrorResponse)?.message || "Search failed"
                }
            });
        });
    };

    public async searchByCurrentLocation(event?: SubmitEvent<HTMLFormElement>): Promise<void> {
        if (event) {
            event.preventDefault();
        }

        let coords = this.coordinates.current;

        if (!coords) {
            coords = await this.fetchCoordinateFn();
            if (!coords) {
                this.dispatch({
                    type: ActionEvent.SET_API_ERROR,
                    error: {
                        isError: true,
                        message: "Location is not available. Please enable location and try again."
                    }
                });
                return;
            }
        }

        const maxDistanceKm = (this.currentState.userData as FindNearestBranchesParams).maxDistanceKm;
        if (coords.maxDistanceKm !== maxDistanceKm) {
            coords.maxDistanceKm = maxDistanceKm;
        }

        try {
            // Use fetchQuery with cache config - this will use cached data if available
            const queryOptions = getFindNearestBranchesQueryOptions(coords, {
                query: {
                    staleTime: BRANCH_CACHE_CONFIG.staleTime,
                    gcTime: BRANCH_CACHE_CONFIG.gcTime,
                }
            });

            const data = await this.queryClient.fetchQuery(queryOptions);

            if (data == undefined || data.branches.length == 0) {
                this.dispatch({
                    type: ActionEvent.SET_API_ERROR,
                    error: {
                        message: `No branch found within ${coords.maxDistanceKm} km radius`,
                        isError: true
                    }
                });
            } else {
                this.dispatch({
                    type: ActionEvent.SET_API_RESPONSE_SUCCESS,
                    isSuccess: true,
                    message: "Search completed",
                    data
                });
            }
        } catch (error) {
            this.dispatch({
                type: ActionEvent.SET_API_ERROR,
                error: {
                    isError: true,
                    message: (error as ErrorResponse)?.message || "Search failed"
                }
            });
        }
    }

    private handleQueryResponse = (result: QueryObserverResult<BranchResponse, ErrorResponse>) => {
        return {
            status: result.status,
            isError: result.isError,
            isLoading: result.isLoading,
            isFetching: result.isFetching,
            isSuccess: result.isSuccess,
            error: result.error,
            data: result.data
        };
    };
}
