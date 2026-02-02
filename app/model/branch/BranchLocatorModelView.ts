import {useFindNearestBranches, useSearchBranchesByArea
} from "~/api/branch-locator/generated/endpoints/branch-location/branch-location";
import {type Dispatch, useMemo, useReducer, useRef} from "react";
import {createZodResolver} from "~/model/auth/zod/ZodResolver";
import type {Error, TypeError} from "~/domain/error/Error";
import type {
    BranchSearchResponse, ErrorResponse, FindNearestBranchesParams,
    NearbyBranchesResponse, SearchBranchesByAreaParams
} from "~/domain/branch-locator/generated/model";
import {BranchLocatorSchema, type BranchLocatorState} from "~/domain/branch-locator/BranchLocator";
import {ViewModel} from "~/model/ViewModel";
import {type ActionDispatch, ActionEvent} from "~/model/ActionEvent";
import type {UseQueryResult} from "@tanstack/react-query";
type Resolver =  (data: (SearchBranchesByAreaParams | FindNearestBranchesParams)) => Promise<{
    values: SearchBranchesByAreaParams | FindNearestBranchesParams
    errors?: undefined
} | {
    errors: TypeError<NearbyBranchesResponse | BranchSearchResponse>
    values?: undefined
}>

export const useBranchLocatorModelView = () => {


    const reducer = ViewModel.reducer<SearchBranchesByAreaParams|FindNearestBranchesParams,
        NearbyBranchesResponse|BranchSearchResponse,
        BranchLocatorState
    >(SearchInitialState)

    const [state, dispatch] = useReducer(reducer, SearchInitialState);


    const areaQuery = useSearchBranchesByArea(
        state.userData as SearchBranchesByAreaParams, {query: { enabled: false }}
    )

    const reference  = useRef<FindNearestBranchesParams>(null)
    const referenceError  = useRef<Error>(null)


    const getLatLong =()=>{
        try{
            const  location =state.userData as FindNearestBranchesParams;

             BranchLocatorModelView.getLatLong()
                    .then(data => {
                        reference.current =  {
                            latitude: data.lng ,
                            longitude: data.lng,
                            limit:location.limit ,
                            maxDistanceKm: location.maxDistanceKm,
                        } as FindNearestBranchesParams
                    })
                 .catch(err=>{
                     referenceError.current =   {
                             isError: true,
                             message: "Failed to get location info, please enable location and try again."
                     };
                   })

             if(referenceError.current !==null){
                 dispatch({type:ActionEvent.SET_API_ERROR, error:{
                          isError: true,
                          message: referenceError.current.message
                     }})
             }
            return reference.current

        }
        catch(error){

            dispatch({type: ActionEvent.SET_API_ERROR, error: {
                    isError: true,
                    message: error as string ||"Failed to get location info, please enable location and try again."
                }})
        }


    }

    const latLongMemo = useMemo(
        () => getLatLong()!,
        []
    );
    const nearbyQuery = useFindNearestBranches(
          latLongMemo, {query: { enabled: false }})


    const resolver = useMemo(
        () => createZodResolver<SearchBranchesByAreaParams|FindNearestBranchesParams, TypeError<NearbyBranchesResponse|BranchSearchResponse>>(BranchLocatorSchema),
        []
    );

    const model = useMemo(
        () => new BranchLocatorModelView(state, dispatch, resolver,nearbyQuery,areaQuery),
        [state, resolver]
    );

    return {
        state,
        model
    }
}

export class BranchLocatorModelView extends ViewModel<SearchBranchesByAreaParams|FindNearestBranchesParams, NearbyBranchesResponse|BranchSearchResponse, BranchLocatorState> {

    private static  GEOLOCATION_TIME_OUT =5000;
    private static GEOLOCATION_AGE = 0;

    constructor(
        protected state: BranchLocatorState,
        protected dispatch: Dispatch<ActionDispatch<SearchBranchesByAreaParams|FindNearestBranchesParams,NearbyBranchesResponse|BranchSearchResponse>>,
        protected resolver: Resolver,
         private nearbyQuery: UseQueryResult<NearbyBranchesResponse, ErrorResponse> & { queryKey: readonly unknown[] & {} },
        private  areaQuery: UseQueryResult<BranchSearchResponse, ErrorResponse> & { queryKey: readonly unknown[] & {}},
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
            // You could dispatch an error message to the UI here
            throw Error(error as string||"Failed to get location info, please enable location and try again");
        }
    }
    public async  getNearestBranchesByLatLong() {

            const{isError, isSuccess,error, isLoading,isFetching ,data}= await this.nearbyQuery.refetch()

            console.log("isError:",isError,"isSuccess:",isSuccess, "isLoading:", isLoading, "isFetching:", isFetching,"data:",data)


            if (isSuccess) {

                this.dispatch({
                    type: ActionEvent.SET_API_RESPONSE_SUCCESS,
                    message: 'Search completed successfully',
                    isSuccess: true,
                    field:"searchType" as keyof (SearchBranchesByAreaParams | FindNearestBranchesParams),
                    value:"latLong",
                    data: this.nearbyQuery.data
                })
            }

            if (isError) {

                console.log("isError:",isError,error);
                this.dispatch({
                    type: ActionEvent.SET_API_ERROR,
                    error: {
                        message: error?.message || 'Search failed',
                        status: error?.status,
                        isError: true
                    }
                })
            }

            if (isLoading || isFetching) {
                this.dispatch({type: ActionEvent.SET_LOADING, isLoading: true})
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

    submitToAPI = async (data: SearchBranchesByAreaParams ) => {
           console.log("Search area", data)
          await this.areaQuery.refetch()
    }
}

const SearchInitialState: BranchLocatorState = {
    searchType: "area",
    onSubmit: "",
    errors: {
        searchText:{
            isError: false,
            message:""
        },
        response: {
            isError: false,
            message: ''
        }
    } as  TypeError<SearchBranchesByAreaParams | FindNearestBranchesParams> ,
    isLoading: false,
    userData: {
        searchText: "",
        maxDistanceKm: 5,
        limit:10,

    }
}