import type { State } from "~/domain/State";
import type { AppointmentResponse, AppointmentsResponse } from "~/domain/appointment/generated/model";

/**
 * Query parameters for fetching user appointments
 */
export interface UserAppointmentsQuery {
    customerUsername: string;
    expandedAppointmentId: string;
    activeTab: 'branch' | 'appointments';
}

/**
 * State for user appointments
 */
export interface UserAppointmentsState extends State<UserAppointmentsQuery, AppointmentsResponse> {
    appointments: AppointmentResponse[];
}

/**
 * Sort appointments: BOOKED first, then by date descending
 */
export const sortAppointments = (appointments: AppointmentResponse[]): AppointmentResponse[] => {
    return [...appointments].sort((a, b) => {
        // BOOKED appointments come first
        if (a.status === "BOOKED" && b.status !== "BOOKED") return -1;
        if (a.status !== "BOOKED" && b.status === "BOOKED") return 1;

        // Then sort by date descending (newest first)
        return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
    });
};
