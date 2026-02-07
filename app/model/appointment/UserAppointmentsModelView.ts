import {type RefObject, useCallback, useEffect, useMemo, useReducer, useRef} from "react";
import type { CSSProperties, Dispatch } from "react";
import {
    useGetCustomerAppointments,
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

    const reducer = ViewModel.reducer<UserAppointmentsQuery, AppointmentsResponse, UserAppointmentsState>(initialUserAppointmentsState);
    const [state, dispatch] = useReducer(reducer, initUserAppointments(username));

    const stateRef = useRef(state);
    stateRef.current = state;

    const stableDispatch = useCallback(
        (action: ActionDispatch<UserAppointmentsQuery, AppointmentsResponse>) => dispatch(action),
        []
    );

    // Fetch appointments query
    const appointmentsQuery = useGetCustomerAppointments(
        username,
        undefined,
        {
            query: {
                enabled: !!username,
                staleTime: 30000,
                refetchOnWindowFocus: false,
            }
        }
    );

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
            stableDispatch({ type: ActionEvent.SET_LOADING, isLoading: false });
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
            stableDispatch({ type: ActionEvent.SET_LOADING, isLoading: false });
        }
    }, [appointmentsQuery.isError, appointmentsQuery.error, stableDispatch]);

    const model = useMemo(
        () => new UserAppointmentsModelView(
            stateRef,
            stableDispatch,
            appointmentsQuery.refetch
        ),
        [stableDispatch, appointmentsQuery.refetch]
    );

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
    };
};

export class UserAppointmentsModelView {
    constructor(
        private stateRef: RefObject<UserAppointmentsState>,
        protected dispatch: Dispatch<ActionDispatch<UserAppointmentsQuery, AppointmentsResponse>>,
        private refetchFn: () => void
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

    /** Update single appointment in list (called after cancel/reschedule) */
    updateAppointment = (updatedAppointment: AppointmentResponse): void => {
        const currentResponse = this.state.response?.data;
        if (!currentResponse) return;

        const updatedAppointments = currentResponse.appointments.map(apt =>
            apt.id === updatedAppointment.id ? updatedAppointment : apt
        );

        this.dispatch({
            type: ActionEvent.SET_API_RESPONSE_SUCCESS,
            message: "Appointment updated",
            data: {
                ...currentResponse,
                appointments: updatedAppointments,
            },
        });
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
