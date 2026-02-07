import type { State } from "~/domain/State";
import type { AppointmentResponse } from "~/domain/appointment/generated/model";

/**
 * Data for cancel appointment
 */
export interface CancelAppointmentData {
    appointmentId: string;
    reason: string;
    isModalOpen: boolean;
}

/**
 * State for cancel appointment modal
 */
export interface CancelAppointmentState extends State<CancelAppointmentData, AppointmentResponse> {
    appointment: AppointmentResponse | null;
    toastMessage: string;
    toastVisible: boolean;
}

/**
 * Initial state for cancel appointment
 */
export const initialCancelAppointmentState: CancelAppointmentState = {
    isLoading: false,
    appointment: null,
    toastMessage: "",
    toastVisible: false,
    errors: {
        appointmentId: { isError: false },
        reason: { isError: false },
        isModalOpen: { isError: false },
        response: { isError: false },
    },
    userData: {
        appointmentId: "",
        reason: "",
        isModalOpen: false,
    },
};
