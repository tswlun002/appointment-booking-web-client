import type { PaginatedState } from "~/domain/State";
import type { AppointmentResponse, AppointmentsResponse } from "~/domain/appointment/generated/model";

/** Default pagination limit */
export const DEFAULT_PAGE_LIMIT = 10;

/**
 * Query parameters for fetching user appointments
 */
export interface UserAppointmentsQuery {
    customerUsername: string;
    expandedAppointmentId: string;
    activeTab: 'branch' | 'appointments';
    offset: number;
    limit: number;
}

/**
 * State for user appointments - extends PaginatedState for pagination support
 * items: AppointmentResponse[] - accumulated appointments from all loaded pages
 */
export type UserAppointmentsState = PaginatedState<UserAppointmentsQuery, AppointmentsResponse, AppointmentResponse>;

/**
 * Sort appointments: BOOKED first (closest date ascending), then others (date descending)
 */
export const sortAppointments = (appointments: AppointmentResponse[]): AppointmentResponse[] => {
    return [...appointments].sort((a, b) => {
        // BOOKED appointments come first
        if (a.status === "BOOKED" && b.status !== "BOOKED") return -1;
        if (a.status !== "BOOKED" && b.status === "BOOKED") return 1;

        // BOOKED: sort by closet date first (ascending)
        if (a.status === "BOOKED" && b.status === "BOOKED") {
            return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
        }

        // Other statuses: sort by date descending (most recent first)
        return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
    });
};
