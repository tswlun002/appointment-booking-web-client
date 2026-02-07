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
 * Sort appointments: BOOKED first (closest date ascending), then others (date descending)
 */
export const sortAppointments = (appointments: AppointmentResponse[]): AppointmentResponse[] => {
    return [...appointments].sort((a, b) => {
        // BOOKED appointments come first
        if (a.status === "BOOKED" && b.status !== "BOOKED") return -1;
        if (a.status !== "BOOKED" && b.status === "BOOKED") return 1;

        // BOOKED: sort by closest date first (ascending)
        if (a.status === "BOOKED" && b.status === "BOOKED") {
            return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
        }

        // Other statuses: sort by date descending (most recent first)
        return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
    });
};
