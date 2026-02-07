import { useCallback, useMemo, useReducer, useRef } from "react";
import type { Dispatch, RefObject } from "react";
import {
    useCancelAppointment,
    type CancelAppointmentMutationError,
} from "~/api/appointment/generated/endpoints/customer-appointments/customer-appointments";
import { ViewModel } from "~/model/ViewModel";
import { type ActionDispatch, ActionEvent } from "~/model/ActionEvent";
import {
    initialCancelAppointmentState,
    type CancelAppointmentData,
    type CancelAppointmentState,
} from "~/domain/appointment/CancelAppointment";
import type { AppointmentResponse } from "~/domain/appointment/generated/model";
import type { UseMutationResult } from "@tanstack/react-query";
import { LocalDate } from "~/utils/CompanionObjects";

export const useCancelAppointmentModelView = (
    onCancelSuccess: (updatedAppointment: AppointmentResponse) => void
) => {
    const reducer = ViewModel.reducer<CancelAppointmentData, AppointmentResponse, CancelAppointmentState>(
        initialCancelAppointmentState
    );
    const [state, dispatch] = useReducer(reducer, initialCancelAppointmentState);

    const stateRef = useRef(state);
    stateRef.current = state;

    const stableDispatch = useCallback(
        (action: ActionDispatch<CancelAppointmentData, AppointmentResponse>) => dispatch(action),
        []
    );

    const cancelMutation = useCancelAppointment();

    const model = useMemo(
        () => new CancelAppointmentModelView(
            stateRef,
            stableDispatch,
            cancelMutation,
            onCancelSuccess
        ),
        [stableDispatch, cancelMutation, onCancelSuccess]
    );

    return { state, model };
};

export class CancelAppointmentModelView {
    constructor(
        private stateRef: RefObject<CancelAppointmentState>,
        protected dispatch: Dispatch<ActionDispatch<CancelAppointmentData, AppointmentResponse>>,
        private cancelMutation: UseMutationResult<
            AppointmentResponse,
            CancelAppointmentMutationError,
            { appointmentId: string; data: { reason?: string } },
            unknown
        >,
        private onCancelSuccess: (updatedAppointment: AppointmentResponse) => void
    ) {}

    private get state(): CancelAppointmentState {
        return this.stateRef.current!;
    }

    /** Open cancel modal with appointment */
    openModal = (appointment: AppointmentResponse): void => {
        this.dispatch({ type: ActionEvent.SET_FIELD, field: "appointmentId", value: appointment.id });
        this.dispatch({ type: ActionEvent.TOGGLE_MODAL, field: "isModalOpen", value: true });
        // Store appointment for display
        this.dispatch({
            type: ActionEvent.SET_API_RESPONSE_SUCCESS,
            message: "",
            data: appointment
        });
    };

    /** Close modal and reset */
    closeModal = (): void => {
        this.dispatch({ type: ActionEvent.TOGGLE_MODAL, field: "isModalOpen", value: false });
        this.dispatch({ type: ActionEvent.SET_FIELD, field: "appointmentId", value: "" });
        this.dispatch({ type: ActionEvent.SET_FIELD, field: "reason", value: "" });
        this.dispatch({ type: ActionEvent.SET_API_ERROR, error: { isError: false, message: "" } });
    };

    /** Set cancel reason */
    setReason = (reason: string): void => {
        this.dispatch({ type: ActionEvent.SET_FIELD, field: "reason", value: reason });
    };

    /** Get appointment being cancelled */
    get appointment(): AppointmentResponse | null {
        return this.state.response?.data ?? null;
    }

    /** Get current reason */
    get reason(): string {
        return this.state.userData.reason;
    }

    /** Check if modal is open */
    get isModalOpen(): boolean {
        return this.state.userData.isModalOpen;
    }

    /** Confirm cancellation */
    confirmCancel = async (): Promise<void> => {
        const appointmentId = this.state.userData.appointmentId;
        const reason = this.state.userData.reason.trim();

        if (!reason) {
            this.dispatch({
                type: ActionEvent.SET_API_ERROR,
                error: { isError: true, message: "Please provide a reason for cancellation" },
            });
            return;
        }

        if (!appointmentId) return;

        this.dispatch({ type: ActionEvent.SET_LOADING, isLoading: true });

        try {
            const response = await this.cancelMutation.mutateAsync({
                appointmentId,
                data: { reason },
            });

            // Notify parent to update appointment list
            this.onCancelSuccess(response);

            this.closeModal();
            this.showToast("Appointment cancelled successfully");
        } catch (error) {
            const err = error as CancelAppointmentMutationError;
            this.dispatch({
                type: ActionEvent.SET_API_ERROR,
                error: { isError: true, message: err?.message || "Failed to cancel appointment" },
            });
        } finally {
            this.dispatch({ type: ActionEvent.SET_LOADING, isLoading: false });
        }
    };

    /** Show toast */
    showToast = (message: string): void => {
        this.dispatch({ type: ActionEvent.SET_FIELD, field: "toastMessage" as keyof CancelAppointmentData, value: message });
        this.dispatch({ type: ActionEvent.SET_FIELD, field: "toastVisible" as keyof CancelAppointmentData, value: true });
        setTimeout(() => this.hideToast(), 3000);
    };

    /** Hide toast */
    hideToast = (): void => {
        this.dispatch({ type: ActionEvent.SET_FIELD, field: "toastVisible" as keyof CancelAppointmentData, value: false });
        this.dispatch({ type: ActionEvent.SET_FIELD, field: "toastMessage" as keyof CancelAppointmentData, value: "" });
    };

    /** Format full date */
    formatFullDate = (dateTime: string): string => {
        const date = new Date(dateTime);
        return `${LocalDate.shortDayName(date)} ${LocalDate.dayOfTheMonth(date)} ${new Intl.DateTimeFormat("en-ZA", { month: "short" }).format(date)} ${date.getFullYear()}`;
    };
}
