import {type RefObject, useCallback, useEffect, useMemo, useReducer, useRef} from "react";
import type { CSSProperties, Dispatch } from "react";
import {
    useGetCustomerAppointments,
    getGetCustomerAppointmentsQueryKey,
    type GetCustomerAppointmentsQueryError,
    getCustomerAppointments,
} from "~/api/appointment/generated/endpoints/customer-appointments/customer-appointments";
import { ViewModel } from "~/model/ViewModel";
import { type ActionDispatch, ActionEvent } from "~/model/ActionEvent";
import {
    sortAppointments,
    type UserAppointmentsQuery,
    type UserAppointmentsState,
    DEFAULT_PAGE_LIMIT,
} from "~/domain/appointment/UserAppointments";
import type { AppointmentResponse, AppointmentsResponse } from "~/domain/appointment/generated/model";
import { AppointmentStatus } from "~/domain/appointment/generated/model";
import useAuthStore from "~/model/auth/zustand/AuthStore";
import { useShallow } from "zustand/react/shallow";
import { LocalDate } from "~/utils/CompanionObjects";
import { getStatusColors } from "~/resources/colors/colors";
import { APPOINTMENT_CACHE_CONFIG, queryClient } from "~/lib/react-query/Client";
import { useCancelAppointmentModelView } from "~/model/appointment/CancelAppointmentModelView";
import { type NavigateFunction, useNavigate } from "react-router";

const initialUserAppointmentsState: UserAppointmentsState = {
    isLoading: true,
    items: [],
    pagination: null,
    errors: {
        customerUsername: { isError: false },
        expandedAppointmentId: { isError: false },
        activeTab: { isError: false },
        offset: { isError: false },
        limit: { isError: false },
        response: { isError: false },
    },
    userData: {
        customerUsername: "",
        expandedAppointmentId: "",
        activeTab: 'branch',
        offset: 0,
        limit: DEFAULT_PAGE_LIMIT,
    },
};

const initUserAppointments = (username: string): UserAppointmentsState => ({
    ...initialUserAppointmentsState,
    userData: {
        ...initialUserAppointmentsState.userData,
        customerUsername: username,
    },
});

/** Extract appointments from API response */
const extractAppointments = (response: AppointmentsResponse): AppointmentResponse[] => response.appointments || [];

/** Extract pagination from API response */
const extractPagination = (response: AppointmentsResponse) => response.pagination || null;

/** Create reducer using base paginatedReducer with sorting */
const userAppointmentsReducer = ViewModel.paginatedReducer<
    UserAppointmentsQuery,
    AppointmentsResponse,
    AppointmentResponse,
    UserAppointmentsState
>(
    initialUserAppointmentsState,
    extractAppointments,
    extractPagination,
    sortAppointments
);

export const useUserAppointmentsModelView = () => {
    const username = useAuthStore(useShallow((s) => s.user?.username ?? ""));
    const navigateFunction = useNavigate();

    const [state, dispatch] = useReducer(userAppointmentsReducer, initUserAppointments(username));

    const stateRef = useRef(state);
    stateRef.current = state;

    const stableDispatch = useCallback(
        (action: ActionDispatch<UserAppointmentsQuery, AppointmentsResponse>) => dispatch(action),
        []
    );

    // Model reference for cancel success callback
    const modelRef = useRef<UserAppointmentsModelView | null>(null);

    // Callback when cancel succeeds - update appointment in list
    const handleCancelSuccess = useCallback((updatedAppointment: AppointmentResponse) => {
        modelRef.current?.updateAppointment(updatedAppointment);
    }, []);

    // Cancel appointment ModelView
    const { state: cancelState, model: cancelModel } = useCancelAppointmentModelView(handleCancelSuccess);

    // Fetch appointments query with cache config and pagination params
    const appointmentsQuery = useGetCustomerAppointments(
        username,
        { offset: 0, limit: DEFAULT_PAGE_LIMIT },
        {
            query: {
                enabled: !!username,
                staleTime: APPOINTMENT_CACHE_CONFIG.staleTime,
                gcTime: APPOINTMENT_CACHE_CONFIG.gcTime,
                refetchOnWindowFocus: APPOINTMENT_CACHE_CONFIG.refetchOnWindowFocus,
            }
        }
    );

    // Consolidated effect: Handle loading, success, and error states
    useEffect(() => {
        // Handle missing username - show error state
        if (!username) {
            stableDispatch({
                type: ActionEvent.SET_API_ERROR,
                error: { isError: true, message: "Session invalid. Please login again." },
            });
            return;
        }

        const { isLoading, isFetching, isSuccess, isError, data, error } = appointmentsQuery;

        // Priority 1: Handle error state
        if (isError) {
            const queryError = error as GetCustomerAppointmentsQueryError;
            stableDispatch({
                type: ActionEvent.SET_API_ERROR,
                error: { isError: true, message: queryError?.message || "Failed to load appointments" },
            });
            return;
        }

        // Priority 2: Handle loading/fetching state
        if (isLoading || isFetching) {
            stableDispatch({ type: ActionEvent.SET_LOADING, isLoading: true });
            return;
        }

        // Priority 3: Handle success state
        if (isSuccess && data) {
            stableDispatch({
                type: ActionEvent.SET_API_RESPONSE_SUCCESS,
                message: "Appointments loaded successfully",
                data: data,
            });
        }
    }, [
        username,
        appointmentsQuery.isLoading,
        appointmentsQuery.isFetching,
        appointmentsQuery.isSuccess,
        appointmentsQuery.isError,
        appointmentsQuery.data,
        appointmentsQuery.error,
        stableDispatch
    ]);

    const model = useMemo(
        () => new UserAppointmentsModelView(
            stateRef,
            stableDispatch,
            appointmentsQuery.refetch,
            navigateFunction,
            username
        ),
        [stableDispatch, appointmentsQuery.refetch, navigateFunction, username]
    );

    // Update modelRef for cancel callback
    modelRef.current = model;

    // Get appointments from state (already sorted in reducer)
    const appointments = state.items;

    return {
        state,
        model,
        appointments,
        cancelState,
        cancelModel,
    };
};

export class UserAppointmentsModelView {
    constructor(
        private stateRef: RefObject<UserAppointmentsState>,
        protected dispatch: Dispatch<ActionDispatch<UserAppointmentsQuery, AppointmentsResponse>>,
        private refetchFn: () => void,
        private navigateFunction: NavigateFunction,
        private username: string
    ) {}

    private get state(): UserAppointmentsState {
        return this.stateRef.current!;
    }

    /** Check if there are more appointments to load */
    get hasMore(): boolean {
        return this.state.pagination?.hasNext ?? false;
    }

    /** Load more appointments (next page) */
    loadMoreAppointments = async (): Promise<void> => {
        const { pagination, userData, isLoading } = this.state;

        // Don't load if already loading or no more pages
        if (isLoading || !pagination?.hasNext) {
            return;
        }

        // Update offset first, then set loading
        const nextOffset = userData.offset + userData.limit;
        this.dispatch({ type: ActionEvent.SET_FIELD, field: "offset", value: nextOffset });
        this.dispatch({ type: ActionEvent.SET_LOADING, isLoading: true });

        try {
            const response = await getCustomerAppointments(
                this.username,
                { offset: nextOffset, limit: userData.limit }
            );

            this.dispatch({
                type: ActionEvent.SET_API_RESPONSE_SUCCESS,
                message: "Loaded more appointments",
                data: response,
            });
        } catch (error) {
            const errorMessage = (error as Error)?.message || "Failed to load more appointments";
            this.dispatch({
                type: ActionEvent.SET_API_ERROR,
                error: { isError: true, message: errorMessage },
            });
        }
    };

    /** Refetch appointments */
    refetch = (): void => {
        this.refetchFn();
    };

    /** Toggle expanded appointment info */
    toggleAppointmentInfo = (appointmentId: string): void => {
        const currentExpanded = this.state.userData.expandedAppointmentId;
        const newExpanded = currentExpanded === appointmentId ? "" : appointmentId;
        this.dispatch({
            type: ActionEvent.SET_FIELD,
            field: "expandedAppointmentId",
            value: newExpanded
        });
    };

    /** Handle reschedule - navigate to slots page with reschedule mode */
    handleRescheduleClick = (appointment: AppointmentResponse): void => {
        this.navigateFunction(`/appointments/${appointment.branchId}/slots`, {
            state: {
                mode: 'reschedule',
                appointmentId: appointment.id,
                serviceType: appointment.serviceType,
                branchName: appointment.branchName || `Branch ${appointment.branchId}`,
                currentDateTime: appointment.dateTime,
                rescheduleCount: appointment.rescheduleCount ?? 0,
                distance: "",
            },
        });
    };

    /** Check if appointment is expanded */
    isExpanded = (appointmentId: string): boolean => {
        return this.state.userData.expandedAppointmentId === appointmentId;
    };

    /** Set active tab for mobile navigation */
    setActiveTab = (tab: 'branch' | 'appointments'): void => {
        this.dispatch({
            type: ActionEvent.SET_FIELD,
            field: "activeTab",
            value: tab
        });
    };

    /** Get current active tab */
    get activeTab(): 'branch' | 'appointments' {
        return this.state.userData.activeTab;
    }

    /** Update appointment list after cancel/reschedule - invalidates cache and refetches */
    updateAppointment = (_updatedAppointment: AppointmentResponse): void => {
        // Invalidate react-query cache to trigger refetch with fresh data from server
        const queryKey = getGetCustomerAppointmentsQueryKey(this.username);
        queryClient.invalidateQueries({ queryKey });
    };

    /** Get appointment by ID */
    getAppointmentById = (id: string): AppointmentResponse | undefined => {
        return this.state.response?.data?.appointments.find(apt => apt.id === id);
    };

    // ========== STATUS HELPERS ==========

    /** Get status style for appointment badge */
    getStatusStyle = (status: string): CSSProperties => {
        const statusColor = getStatusColors(status);
        return {
            backgroundColor: statusColor.bg,
            color: statusColor.text,
            borderColor: statusColor.border,
        };
    };

    /** Format date for display (e.g., "06 Feb 2026") */
    formatDate = (dateTime: string): string => {
        const date = new Date(dateTime);
        return `${LocalDate.dayOfTheMonth(date)} ${LocalDate.shortDayName(date)} ${date.getFullYear()}`;
    };

    /** Format time for display (e.g., "10:30 AM") */
    formatTime = (dateTime: string): string => {
        return LocalDate.formattedTime(new Date(dateTime));
    };

    /** Format full date with day name (e.g., "Thu 06 Feb 2026") */
    formatFullDate = (dateTime: string): string => {
        const date = new Date(dateTime);
        return `${LocalDate.shortDayName(date)} ${LocalDate.dayOfTheMonth(date)} ${new Intl.DateTimeFormat("en-ZA", { month: "short" }).format(date)} ${date.getFullYear()}`;
    };

    /** Check if appointment is being processed */
    isBeingProcessed = (status: string): boolean => {
        return status === AppointmentStatus.CHECKED_IN || status === AppointmentStatus.IN_PROGRESS;
    };

    /** Check if appointment can be cancelled or rescheduled */
    canModify = (status: string): boolean => {
        return status === AppointmentStatus.BOOKED;
    };

    /** Check if appointment can be rebooked */
    canRebook = (status: string): boolean => {
        return status === AppointmentStatus.CANCELLED ||
               status === AppointmentStatus.NO_SHOW ||
               status === AppointmentStatus.COMPLETED;
    };

    /** Get display status text */
    getStatusText = (status: string): string => {
        const statusMap: Record<string, string> = {
            [AppointmentStatus.BOOKED]: "Booked",
            [AppointmentStatus.CHECKED_IN]: "Checked In",
            [AppointmentStatus.IN_PROGRESS]: "In Progress",
            [AppointmentStatus.COMPLETED]: "Completed",
            [AppointmentStatus.CANCELLED]: "Cancelled",
            [AppointmentStatus.NO_SHOW]: "No Show",
        };
        return statusMap[status] || status;
    };
}
