import {useFindNearestBranches, useSearchBranchesByArea
} from "~/api/branch-locator/generated/endpoints/branch-location/branch-location";
import {type Dispatch, type RefObject, useCallback, useEffect, useMemo, useReducer, useRef} from "react";
import {createZodResolver} from "~/model/auth/zod/ZodResolver";
import type {TypeError} from "~/domain/error/Error";
import type {
    BranchSearchResponse, ErrorResponse, FindNearestBranchesParams,
    NearbyBranchesResponse, SearchBranchesByAreaParams
} from "~/domain/branch-locator/generated/model";
import {BranchLocatorSchema, type BranchLocatorState} from "~/domain/branch-locator/BranchLocator";
import {ViewModel} from "~/model/ViewModel";
import {type ActionDispatch, ActionEvent} from "~/model/ActionEvent";
import type {UseQueryResult} from "@tanstack/react-query";
import type {QueryObserverResult} from "@tanstack/query-core";

type  BranchParams  = SearchBranchesByAreaParams|FindNearestBranchesParams
type  BranchResponse = NearbyBranchesResponse | BranchSearchResponse


type Resolver =  (data: (BranchParams)) => Promise<{
    values: BranchParams
    errors?: undefined
} | {
    errors: TypeError<BranchResponse>
    values?: undefined
}>

export const useBranchLocatorModelView = () => {


    const reducer = ViewModel.reducer<BranchParams, BranchResponse, BranchLocatorState>
                                                        (SearchInitialState)

    const [state, dispatch] = useReducer(reducer, SearchInitialState);

    const coordinates  = useRef<FindNearestBranchesParams|null>(null)
    const abortControllerRef  = useRef<AbortController|null>(null)

    const areaQuery = useSearchBranchesByArea(
        state.userData as SearchBranchesByAreaParams, {query: { enabled: false }}
    )

    const nearbyQuery = useFindNearestBranches(
        coordinates.current??SearchInitialState.userData as FindNearestBranchesParams, {query: { enabled: false }}
    );


    const resolver = useMemo(
        () => createZodResolver<BranchParams, TypeError<BranchResponse>>(BranchLocatorSchema), []
    );
    const  fetchCoordinates = useCallback(async ():Promise<FindNearestBranchesParams|null> => {

        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();
        try {
            const data = await BranchLocatorModelView.getLatLong();
            const userData = state.userData as FindNearestBranchesParams;
            coordinates.current = {
                        latitude: data.lng,
                        longitude: data.lng,
                        limit: userData.limit,
                        maxDistanceKm: userData.maxDistanceKm,
                    } as FindNearestBranchesParams;



        }catch (err) {
            console.log(err);

            if ((err as DOMException)?.name === "AbortError") {
                // we do update ui on aborted error
                return null
            }
            dispatch(
                {
                    type: ActionEvent.SET_API_ERROR,
                    error: {
                        isError: true,
                        message: (err as Error)?.message || "Failed to get location. Please enable location and try again.",
                    }
                }
            )
        }
        return coordinates.current;

    },[state.userData])

    const model = useMemo(
        () => new BranchLocatorModelView(state, dispatch, resolver,nearbyQuery,areaQuery, coordinates, fetchCoordinates),
        [state, resolver, coordinates]
    );


    useEffect(() => {

        let permissionStatus:PermissionStatus|null = null
         fetchCoordinates()

        //const location = state.userData as FindNearestBranchesParams;
        navigator.permissions.query({name:"geolocation"})
            .then(status=>{
                permissionStatus = status;
                status.onchange=()=>{
                    if(status.state==="granted"){
                        fetchCoordinates();
                    }
                }
            })
        return () => {

            if(permissionStatus){
               permissionStatus.onchange=null;
            }
            abortControllerRef.current?.abort();
        }


    }, [coordinates.current]);


    return {
        state,
        model
    }
}

export class BranchLocatorModelView extends ViewModel<BranchParams, BranchResponse, BranchLocatorState> {

    private static  GEOLOCATION_TIME_OUT =5000;
    private static GEOLOCATION_AGE = 0;

    constructor(
        protected state: BranchLocatorState,
        protected dispatch: Dispatch<ActionDispatch<BranchParams,BranchResponse>>,
        protected resolver: Resolver,
        private nearbyQuery: UseQueryResult<NearbyBranchesResponse, ErrorResponse> & { queryKey: readonly unknown[] & {} },
        private  areaQuery: UseQueryResult<BranchSearchResponse, ErrorResponse> & { queryKey: readonly unknown[] & {}},
        private coordinates: RefObject<FindNearestBranchesParams|null>,
        private  fetchCoordinateFn: () =>  Promise<FindNearestBranchesParams | null>
    ) {
        super(state, dispatch, resolver, SearchInitialState);
    }

    public  static async  getLatLong(){
        try {
        const coords = await this.getNearByBranchesByLatLong();

            if(coords.lng === undefined ||  coords.lng === null){
                throw Error("Failed to get your current location, please enable location and try again");
            }

          return coords;
        } catch (error) {
            console.error("Location error:", error);
            throw Error(error as string||"Failed to get location info, please enable location and try again");
        }
    }

    /**
     * Get current user geolocation(latitude and longitude) and search for nearby branches
     */
    public  static getNearByBranchesByLatLong = (): Promise<{ lat: number; lng: number }> => {
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

    catchStateChange(state: BranchLocatorState): void {
    }

    submitToAPI = async ( ) => {
           await this.executeQuery<ErrorResponse>( async ()=>{
               const  result  = await this.areaQuery.refetch();
               return this.handleQueryResponse(result)
           })
    }
    public  async  searchByCurrentLocation():Promise<void>{

        if(!this.coordinates){
            const newCoordinates = await this.fetchCoordinateFn();
            console.log(this.coordinates)

            if(!newCoordinates) {
                this.dispatch({
                        type: ActionEvent.SET_API_ERROR,
                        error: {
                            isError: true,
                            message: "Location is not available. Please enable location and try again."
                        }
                    }
                )
                return;
            }
        }
         await this.executeQuery<ErrorResponse>(async ()=>{
             const  result  = await this.nearbyQuery.refetch()
             return this.handleQueryResponse(result)

         });

    }
    public  async retryFetchCoordinates(){
        await this.fetchCoordinateFn()
    }

    private  handleQueryResponse =(result: QueryObserverResult<BranchResponse, ErrorResponse>)=>{

            return{
            status:result.status ,
            isError: result.isError,
            isLoading: result.isLoading,
            isFetching: result.isFetching,
            isSuccess: result.isSuccess,
            error:result.error ,
            data:result.data
        }
    }
}

const SearchInitialState: BranchLocatorState = {
    searchType: "latLong",
    errors: {
        searchText:{
            isError: false,
            message:""
        },
        response: {
            isError: false,
            message: ''
        }
    } as  TypeError<BranchParams> ,
    isLoading: false,
    userData: {
        searchText: "",
        maxDistanceKm: 5,
        limit:10,

    }
}