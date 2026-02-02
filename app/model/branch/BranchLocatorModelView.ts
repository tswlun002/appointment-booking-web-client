import {
    useSearchBranchesByArea,
    getFindNearestBranchesQueryOptions
} from "~/api/branch-locator/generated/endpoints/branch-location/branch-location";
import { type Dispatch, type RefObject, useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useQueryClient, type QueryClient, type UseQueryResult } from "@tanstack/react-query";
import { createZodResolver } from "~/model/auth/zod/ZodResolver";
import type { TypeError } from "~/domain/error/Error";
import type {
    BranchSearchResponse, ErrorResponse, FindNearestBranchesParams,
    NearbyBranchesResponse, SearchBranchesByAreaParams
} from "~/domain/branch-locator/generated/model";
import { BranchLocatorSchema, type BranchLocatorState } from "~/domain/branch-locator/BranchLocator";
import { ViewModel } from "~/model/ViewModel";
import { type ActionDispatch, ActionEvent } from "~/model/ActionEvent";
import type { QueryObserverResult } from "@tanstack/query-core";

type BranchParams = SearchBranchesByAreaParams | FindNearestBranchesParams;
type BranchResponse = NearbyBranchesResponse | BranchSearchResponse;

type Resolver = (data: BranchParams) => Promise<{
    values: BranchParams;
    errors?: undefined;
} | {
    errors: TypeError<BranchResponse>;
    values?: undefined;
}>;



export const useBranchLocatorModelView = () => {
    const queryClient = useQueryClient();
    const reducer = ViewModel.reducer<BranchParams, BranchResponse, BranchLocatorState>(SearchInitialState);
    const [state, dispatch] = useReducer(reducer, SearchInitialState);

    const coordinates = useRef<FindNearestBranchesParams | null>(null);

    const fetchCoordinates = useCallback(async (): Promise<FindNearestBranchesParams | null> => {
        try {
            const data = await BranchLocatorModelView.getLatLong();
            const userData = state.userData as FindNearestBranchesParams;

            coordinates.current = {
                latitude: data.lat,
                longitude: data.lng,
                limit: userData.limit ?? 10,
                maxDistanceKm: userData.maxDistanceKm ?? 5,
            };

            return coordinates.current;
        } catch (err) {
            console.log(err)
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
        { query: { enabled: false } }
    );

    const resolver = useMemo(
        () => createZodResolver<BranchParams, TypeError<BranchResponse>>(BranchLocatorSchema), []
    );

    const model = useMemo(
        () => new BranchLocatorModelView(
            state,
            dispatch,
            resolver,
            areaQuery,
            coordinates,
            fetchCoordinates,queryClient
        ),
        [state, resolver, areaQuery, fetchCoordinates, queryClient]
    );

    return { state, model };
};

export class BranchLocatorModelView extends ViewModel<BranchParams, BranchResponse, BranchLocatorState> {

    private static GEOLOCATION_TIME_OUT = 5000;
    private static GEOLOCATION_AGE = 0;

    constructor(
        protected state: BranchLocatorState,
        protected dispatch: Dispatch<ActionDispatch<BranchParams, BranchResponse>>,
        protected resolver: Resolver,
        private areaQuery: UseQueryResult<BranchSearchResponse, ErrorResponse> & { queryKey: readonly unknown[] },
        private coordinates: RefObject<FindNearestBranchesParams | null>,
        private fetchCoordinateFn: () => Promise<FindNearestBranchesParams | null>,
        private queryClient: QueryClient
    ) {
        super(state, dispatch, resolver, SearchInitialState);
    }

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

    catchStateChange(_state: BranchLocatorState): void {}

    submitToAPI = async () => {
        await this.executeQuery<ErrorResponse>(async () => {
            const result = await this.areaQuery.refetch();
            return this.handleQueryResponse(result);
        });
    };

    public async searchByCurrentLocation(): Promise<void> {
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

        this.dispatch({ type: ActionEvent.SET_LOADING, isLoading: true });

        try {
            const data = await this.queryClient.fetchQuery(
                getFindNearestBranchesQueryOptions(coords)
            );

            this.dispatch({
                type: ActionEvent.SET_API_RESPONSE_SUCCESS,
                isSuccess: true,
                message: "Search completed",
                data
            });
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

    public async retryFetchCoordinates(): Promise<void> {
        await this.fetchCoordinateFn();
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
const SearchInitialState: BranchLocatorState = {
    searchType: "latLong",
    errors: {
        searchText: {
            isError: false,
            message: ""
        },
        response: {
            isError: false,
            message: ''
        }
    } as TypeError<BranchParams>,
    isLoading: false,
    userData: {
        searchText: "",
        maxDistanceKm: 5,
        limit: 10,
    }
};