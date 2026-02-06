import {ViewModel} from "~/model/ViewModel";
import {type WeeklySlotsQuery, WeeklySlotsRequestDataSchema, type WeeklySlotsState} from "~/domain/slot/generated/Slot";
import {LocalDate} from "~/utils/CompanionObjects";
import React, {type Dispatch, type MouseEvent, useCallback, useEffect, useMemo, useReducer, useRef} from "react";
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

type SlotStatus = "AVAILABLE" | "FULLY_BOOKED" | "BLOCKED" | "EXPIRED";

type InitProps = {
    branchId: string;
    fromDate: string;
    status: SlotStatus;
    branchName: string;
    distance: string;
};

type Resolver = (data: GetWeeklySlotsParams & { branchId: string }) => Promise<
    | { values: GetWeeklySlotsParams & { branchId: string }; errors?: undefined }
    | { errors: TypeError<GetWeeklySlotsParams & { branchId: string }>; values?: undefined }
>;

// Helper to sort slots by date
const sortSlotsByDate = (slotsByDay: Record<string, SlotResponse[]> | undefined): Map<string, SlotResponse[]> => {
    if (!slotsByDay) return new Map();
    return new Map(
        Object.entries(slotsByDay).sort(([a], [b]) => Date.parse(a) - Date.parse(b))
    );
};

export const useSlotModelView = () => {
    const { branchId } = useParams();
    const locationState = useLocation().state || {};
    const { branchName, distance } = locationState;

    const initProps: InitProps = {
        branchId: branchId ?? "",
        fromDate: LocalDate.formattedDate(LocalDate.now),
        status: "AVAILABLE",
        branchName,
        distance,
    };

    const initialState = initSlots(initProps);
    const reducer = ViewModel.reducer<WeeklySlotsQuery, SlotsResponse, WeeklySlotsState>(initialState);
    const [state, dispatch] = useReducer(reducer, initialState);

    const stableDispatch = useCallback(
        (action: ActionDispatch<WeeklySlotsQuery, SlotsResponse>) => dispatch(action),
        []
    );

    // Keep state fresh in ref for stable model instance
    const stateRef = useRef(state);
    stateRef.current = state;

    const navigateFunction = useNavigate();

    const weeklySlotQueryParam: GetWeeklySlotsParams = {
        fromDate: state.userData.fromDate,
        status: state.userData.status,
    };

    const weeklySlotsQuery = useGetWeeklySlots(
        state.userData.branchId,
        weeklySlotQueryParam,
        { query: { enabled: false } }
    );

    useEffect(() => {
        const abortController = new AbortController();

        const fetchData = async () => {
            try {
                const { isSuccess, data, isLoading, isFetching, isPaused, isError, error } =
                    await weeklySlotsQuery.refetch();

                if (isLoading || isFetching || isPaused) {
                    stableDispatch({ type: ActionEvent.SET_LOADING, isLoading: true });
                    return;
                }

                if (isSuccess && data) {
                    const sorted = sortSlotsByDate(data.slotsByDay);
                    const datesArray = Array.from(sorted.keys());
                    const selectedDate = sorted.size === 2 ? datesArray[0] : state.userData.fromDate;

                    stableDispatch({
                        type: ActionEvent.SET_API_RESPONSE_SUCCESS,
                        isSuccess: true,
                        message: "fetch slot success",
                        field: "fromDate",
                        value: selectedDate?.valueOf(),
                        data,
                    });
                }

                if (isError) {
                    stableDispatch({
                        type: ActionEvent.SET_API_ERROR,
                        error: {
                            isError: true,
                            message: error?.message ?? "Failed to fetch slots",
                        },
                    });
                }
            } catch (error) {
                console.debug("Failed to fetch slots", error);
                stableDispatch({
                    type: ActionEvent.SET_API_ERROR,
                    error: {
                        isError: true,
                        message: (error as Error)?.message ?? "Failed to fetch slots",
                    },
                });
            }
        };

        fetchData();

        return () => abortController.abort();
    }, []);

    const resolver = useMemo(
        () => createZodResolver<WeeklySlotsQuery, TypeError<WeeklySlotsQuery>>(WeeklySlotsRequestDataSchema),
        []
    );

    const model = useMemo(
        () => new SlotModelView(stateRef, stableDispatch, resolver, initialState, navigateFunction),
        [stableDispatch, resolver, navigateFunction]
    );

    const currentWeek = useMemo(() => {
        const sorted = sortSlotsByDate(state.response?.data?.slotsByDay);
        return { days: Array.from(sorted.keys()), data: sorted };
    }, [state.response]);

    const yearMonth = useMemo(
        () => ({
            year: LocalDate.now.getFullYear(),
            month: LocalDate.month,
        }),
        []
    );

    return {
        state,
        model,
        responseData: currentWeek.data,
        days: currentWeek.days,
        yearMonth,
    };
};

  export class SlotModelView extends ViewModel<WeeklySlotsQuery, SlotsResponse, WeeklySlotsState> {
    constructor(
        private stateRef: React.MutableRefObject<WeeklySlotsState>,
        protected dispatch: Dispatch<ActionDispatch<WeeklySlotsQuery, SlotsResponse>>,
        protected resolver: Resolver,
        initialState: WeeklySlotsState,
        private navigateFunction: NavigateFunction
    ) {
        super(stateRef.current, dispatch, resolver, initialState);
    }

    /** Access current state from ref */
    private getCurrentState(): WeeklySlotsState {
        return this.stateRef.current;
    }

    /** Navigate back to branch selection */
    backToBranch = (event: MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        this.navigateFunction("/appointments");
    };

    /** Check if slot is fully booked */
    isFullyBooked = (slot: SlotResponse): boolean => {
        return slot.bookingCount === slot.maxBookingCapacity;
    };

    /** Handle date selection */
    selectedDay = (date: string, event: MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        this.dispatch({ type: ActionEvent.SET_FIELD, field: "fromDate", value: date });
    };

    /** Format time string to HH:MM */
    sliceTime = (time: string): string => {
        return time?.length >= 5 ? time.slice(0, 5) : "";
    };

    /** Handle slot selection */
    selectSlot = (slotId: string, event: MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        this.dispatch({ type: ActionEvent.SET_FIELD, field: "selectedSlotId", value: slotId });
    };

    /** Navigate to booking page with slot data */
    navigateToBooking = (slot: SlotResponse, displayDate: string, slotTime: string): void => {
        const currentState = this.getCurrentState();
        const branchId = currentState.userData.branchId;
        const slotId = slot.id;

        this.navigateFunction(`/appointments/${branchId}/slots/${slotId}/book`, {
            state: {
                slotId,
                branchId,
                branchName: currentState.branchName,
                day: currentState.userData.fromDate,
                startTime: slot.startTime,
                endTime: slot.endTime,
                displayDate,
                slotTime,
            },
        });
    };
}

const initSlots = ({ branchId, fromDate, status, branchName, distance }: InitProps): WeeklySlotsState => ({
    branchName,
    distance,
    isLoading: false,
    errors: {
        response: { isError: false },
        fromDate: { isError: false },
        status: { isError: false },
        branchId: { isError: false },
        selectedSlotId: { isError: false },
        serviceType: { isError: false },
    },
    userData: {
        branchId,
        status,
        fromDate,
        serviceType: "",
        selectedSlotId: "",
    },
});

