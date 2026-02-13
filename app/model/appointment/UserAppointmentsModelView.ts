import {type RefObject, useCallback, useEffect, useMemo, useReducer, useRef} from "react";
import type { CSSProperties, Dispatch } from "react";
import {
    useGetCustomerAppointments,
    getGetCustomerAppointmentsQueryKey,
    type GetCustomerAppointmentsQueryError,
} from "~/api/appointment/generated/endpoints/customer-appointments/customer-appointments";
import { ViewModel } from "~/model/ViewModel";
import { type ActionDispatch, ActionEvent } from "~/model/ActionEvent";
import {
    sortAppointments,
    type UserAppointmentsQuery,
    type UserAppointmentsState,
} from "~/domain/appointment/UserAppointments";
import type { AppointmentResponse, AppointmentsResponse } from "~/domain/appointment/generated/model";
import { AppointmentStatus } from "~/domain/appointment/generated/model";
import useAuthStore from "~/model/auth/zustand/AuthStore";
import { useShallow } from "zustand/react/shallow";
import { LocalDate } from "~/utils/CompanionObjects";
import { getStatusColors } from "~/resources/colors/colors";
import { APPOINTMENT_CACHE_CONFIG, getCachedAppointmentData, queryClient } from "~/lib/react-query/Client";
import { useCancelAppointmentModelView } from "~/model/appointment/CancelAppointmentModelView";
import { type NavigateFunction, useNavigate } from "react-router";

const initialUserAppointmentsState: UserAppointmentsState = {
    isLoading: true,
    appointments: [],
    errors: {
        customerUsername: { isError: false },
        expandedAppointmentId: { isError: false },
        activeTab: { isError: false },
        response: { isError: false },
    },
    userData: {
        customerUsername: "",
        expandedAppointmentId: "",
        activeTab: 'branch',
    },
};

const initUserAppointments = (username: string): UserAppointmentsState => ({
    ...initialUserAppointmentsState,
    userData: {
        ...initialUserAppointmentsState.userData,
        customerUsername: username,
    },
});

export const useUserAppointmentsModelView = () => {
    const username = useAuthStore(useShallow((s) => s.user?.username ?? ""));
    const navigateFunction = useNavigate();

    const reducer = ViewModel.reducer<UserAppointmentsQuery, AppointmentsResponse, UserAppointmentsState>(initialUserAppointmentsState);
    const [state, dispatch] = useReducer(reducer, initUserAppointments(username));

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

    // Fetch appointments query with cache config
    const appointmentsQuery = useGetCustomerAppointments(
        username,
        undefined,
        {
            query: {
                enabled: !!username,
                staleTime: APPOINTMENT_CACHE_CONFIG.staleTime,
                gcTime: APPOINTMENT_CACHE_CONFIG.gcTime,
                refetchOnWindowFocus: false,
            }
        }
    );

    // Check for cached data on mount and populate state
    useEffect(() => {
        // Don't overwrite if we already have data
        if (state.response?.data) return;
        if (!username) return;

        // Get cached appointment data for this user
        const cachedData = getCachedAppointmentData(username);
        if (cachedData?.data) {
            stableDispatch({
                type: ActionEvent.SET_API_RESPONSE_SUCCESS,
                message: "Loaded from cache",
                data: cachedData.data
            });
            stableDispatch({ type: ActionEvent.SET_LOADING, isLoading: false });
        }
    }, [username]); // Only run on mount or when username changes

    // Handle loading state
    useEffect(() => {
        if (appointmentsQuery.isLoading) {
            stableDispatch({ type: ActionEvent.SET_LOADING, isLoading: true });
        }
    }, [appointmentsQuery.isLoading, stableDispatch]);

    // Handle success
    useEffect(() => {
        if (appointmentsQuery.isSuccess && appointmentsQuery.data) {
            stableDispatch({
                type: ActionEvent.SET_API_RESPONSE_SUCCESS,
                message: "Appointments loaded successfully",
                data: appointmentsQuery.data,
            });
        }
    }, [appointmentsQuery.isSuccess, appointmentsQuery.data, stableDispatch]);

    // Handle error
    useEffect(() => {

        if (appointmentsQuery.isError) {
            const error = appointmentsQuery.error as GetCustomerAppointmentsQueryError;
            stableDispatch({
                type: ActionEvent.SET_API_ERROR,
                error: { isError: true, message: error?.message || "Failed to load appointments" },
            });
        }
    }, [appointmentsQuery.isError, appointmentsQuery.error, stableDispatch]);

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

    // Get sorted appointments from response
    const appointments = useMemo(() => {
        if (state.response?.data?.appointments) {
            return sortAppointments(state.response.data.appointments);
        }
        return [];
    }, [state.response?.data]);

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

    /** Refetch appointments */
    refetch = (): void => {
        this.dispatch({ type: ActionEvent.SET_LOADING, isLoading: true });
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
