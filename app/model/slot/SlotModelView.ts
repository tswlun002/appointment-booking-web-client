import {ViewModel} from "~/model/ViewModel";
import {type WeeklySlotsQuery, WeeklySlotsRequestDataSchema, type WeeklySlotsState} from "~/domain/slot/generated/Slot";
import {DayOfWeek, LocalDate} from "~/utils/CompanionObjects";
import {type Dispatch, type MouseEvent, useEffect, useMemo, useReducer} from "react";
import {useGetWeeklySlots} from "~/api/slot/generated/endpoints/slot-queries/slot-queries";
import {type NavigateFunction, useLocation, useNavigate, useParams} from "react-router";
import type {
    GetWeeklySlotsParams,
    SlotResponse,
    SlotsResponse
} from "~/domain/slot/generated/model";
import type {TypeError} from "~/domain/error/Error";
import {createZodResolver} from "~/model/auth/zod/ZodResolver";
import {type ActionDispatch, ActionEvent} from "~/model/ActionEvent";

type  InitPros ={
     branchId:string,
     fromDate:string,
     status:"AVAILABLE"| "FULLY_BOOKED"| "BLOCKED"| "EXPIRED",
     branchName:string,
     distance:string,
 }

 type Resolver = (data: (GetWeeklySlotsParams & {
    branchId: string
})) => Promise<{
    values: GetWeeklySlotsParams & {
        branchId: string
    }
    errors?: undefined
} | {
    errors: TypeError<GetWeeklySlotsParams & {
        branchId: string
    }>
    values?: undefined
}>

export const useSlotModelView =  () => {

    const {branchId} = useParams();
    const locationState = useLocation().state || {};
    const {branchName, distance } = locationState;

    const branchIdFromDateStatus:InitPros = {
        branchId:branchId??"",
        fromDate:LocalDate.formattedDate(LocalDate.now),
        status:"AVAILABLE",
        branchName:branchName,
        distance:distance
    };
    const initialState = initSlots(branchIdFromDateStatus);
    const reducer = ViewModel.reducer<WeeklySlotsQuery,SlotsResponse,WeeklySlotsState>(initialState);
    const [state, dispatch] = useReducer(reducer, initialState);

    const navigateFunction = useNavigate();
    const weeklySlotQueryParam:GetWeeklySlotsParams ={
        fromDate:state.userData.fromDate,
        status:state.userData.status
    }
    const useGetWeeklySlotsQuery = useGetWeeklySlots(
            state.userData.branchId,
            weeklySlotQueryParam,
            { query: { enabled: false } }
    );

    useEffect(() => {
        const abortController = new AbortController();

        const fetchData = async () => {
            dispatch({ type: ActionEvent.SET_LOADING, isLoading: true });

            try {
                const {
                    isSuccess,
                    data,
                    isLoading,
                    isFetching,
                    isPaused,
                    isError,
                    error
                } = abortController && await useGetWeeklySlotsQuery.refetch();


                if (isLoading || isFetching || isPaused) {
                    dispatch({type: ActionEvent.SET_LOADING, isLoading: true})
                }


                if (isSuccess) {

                    const sorted:Map<string,SlotResponse[]> = new Map<string, SlotResponse[]>(
                             Object.entries(data.slotsByDay
                        ).sort(([a,_a],[b,_b])=>Date.parse(a)-Date.parse(b)));


                    const array = Array.from(sorted.keys());

                    const key = sorted.size === 2?array[0]:state.userData.fromDate;

                    dispatch({
                        type: ActionEvent.SET_API_RESPONSE_SUCCESS,
                        isSuccess: true,
                        message: "fetch slot success",
                        field:"fromDate", value:key?.valueOf(),
                        data: data
                    });
                }

                if (isError) {

                    dispatch({
                        type: ActionEvent.SET_API_ERROR,
                        error: {
                            isError: true,
                            message: error?.message ?? "Failed to fetch slots",
                        }
                    })
                }
            }
            catch (error) {
                console.debug("Failed to fetch slots ",error);
                dispatch({
                    type: ActionEvent.SET_API_ERROR,
                    error: {
                        isError: true,
                        message: (error as Error)?.message ?? "Failed to fetch slots",
                    }
                })
            }
        }
        fetchData();
        return () => {
            abortController.abort();
        };

   }, []);



    const  resolver = useMemo(()=>
            createZodResolver<WeeklySlotsQuery, TypeError<WeeklySlotsQuery>>(WeeklySlotsRequestDataSchema),
        [])

    const model = useMemo(()=> new SlotModelView(state,dispatch,resolver,initialState, navigateFunction),
        [state, resolver]
    );


    const currentWeek = useMemo(()=>{


        const sorted:Map<string,SlotResponse[]> = new Map<string, SlotResponse[]>(
            Object.entries(state.response?.data?.slotsByDay??{})
            .sort(([a,_a],[b,_b])=>Date.parse(a)-Date.parse(b))
        );

        return {days: Array.from(sorted.keys()), data:sorted };

    }, [state.response]);


    return {
        state,
        model,
        responseData:currentWeek.data,
        days: currentWeek.days,
    }

};

  export  class SlotModelView extends  ViewModel<WeeklySlotsQuery,SlotsResponse, WeeklySlotsState>{
     constructor(
         protected state:WeeklySlotsState,
         protected dispatch:Dispatch<ActionDispatch<WeeklySlotsQuery, SlotsResponse>>,
         protected  resolver:Resolver,
         initialState: WeeklySlotsState,
         private navigateFunction: NavigateFunction
     ) {
         super(state,dispatch,resolver,initialState);
     }

       getLocalDayOfYear = (date: Date): number => {

          const start = new Date(LocalDate.now.getFullYear(), 0, 0);
          const diff = LocalDate.now.getTime() - start.getTime();
          return Math.floor(diff / (1000 * 60 * 60 * 24));
      };

       yearMonth =() => {


          const year = LocalDate.now.getFullYear();

          const days = Array.from({ length: 7 }, (_, i) => {

              const nextDate = new Date(LocalDate.now)
              nextDate.setDate(LocalDate.now.getDate() + i);
              const dayOfYear = this.getLocalDayOfYear(nextDate);

              if (i === 0 && this.state.userData.fromDate === null) {
                  this.dispatch({type:ActionEvent.SET_FIELD,field:"fromDate", value:dayOfYear})
              }

              return {
                  dayNumber: nextDate.getDate(),
                  dayName: DayOfWeek[nextDate.getDay()],
                  dayOfYear: dayOfYear,
                  isFull: i === 3
              };
          });

          return { year, month: LocalDate.month, days };
      };

       formateSlot = (startTime:string) => {

           return `${startTime.padStart(2, '0')}`
       }

      backToBranch(event:MouseEvent<HTMLButtonElement>) {
          event.preventDefault();
          this.navigateFunction('/appointments')
      }

      isFullBooked(slot:SlotResponse) {

         return  slot.bookingCount===slot.maxBookingCapacity
      }

      selectedDay(date:string, e: MouseEvent<HTMLButtonElement>) {
          e.preventDefault();
          this.dispatch({type:ActionEvent.SET_FIELD,field:"fromDate", value:date})

      }

      sliceTime(endTime: string) {
          return (endTime !== undefined && endTime.length >= 5) ? endTime.slice(0, 5) : ""
      }

      selectSlot(slotId: string, e: MouseEvent<HTMLButtonElement>) {
           e.preventDefault();
          this.dispatch({ type:ActionEvent.SET_FIELD, field:"selectedSlotId", value:slotId });
      }
  }
const  initSlots =({branchId, fromDate, status,branchName,distance}:InitPros):WeeklySlotsState=> {

    return {
        branchName:branchName,
        distance:distance,
        errors: {
            response: {
                isError: false
            },
            fromDate: {
                isError: false
            },
            status: {
                isError: false
            },
            branchId: {
                isError: false
            },
            selectedSlotId:{
                isError:false,

            },
            serviceType:{
                isError:false
            }
        },
        isLoading: false,
        userData: {
            branchId:branchId,
            status: status,
            fromDate:fromDate ,
            serviceType:"",
            selectedSlotId:""

        },


    }
}

