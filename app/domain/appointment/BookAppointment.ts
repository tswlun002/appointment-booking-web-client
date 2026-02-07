import { z } from "zod";
import type { State } from "~/domain/State";
import type { AppointmentResponse, CreateAppointmentRequest, RescheduleAppointmentRequest } from "~/domain/appointment/generated/model";
import { createAppointmentBody } from "~/domain/appointment/generated/zod";

// Static service types list
export const SERVICE_TYPES = [
    "Loan/Credit Services",
    "Account/Card Services",
    "Business Banking",
    "Disputes & Queries",
    "Other",
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

// Zod schema for validation - extends generated schema
export const BookAppointmentSchema = createAppointmentBody.extend({
    serviceType: z.enum(SERVICE_TYPES, { error: "Please select a service type" }),
    slotId: z.string().min(1, "Slot is required"),
    branchId: z.string().min(1, "Branch is required"),
    customerUsername: z.string().min(5, "Username is required"),
    day: z.string().min(1, "Date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
});

export interface BookAppointmentData extends CreateAppointmentRequest {
    branchName: string;
    slotTime: string;
    displayDate: string;
    isModalOpen: boolean;
    // Reschedule mode fields
    isRescheduleMode?: boolean;
    appointmentId?: string;
}

export interface BookAppointmentState extends State<BookAppointmentData, AppointmentResponse> {
    isRescheduleMode: boolean;
}

/** Convert BookAppointmentData to RescheduleAppointmentRequest */
export const toRescheduleRequest = (data: BookAppointmentData): RescheduleAppointmentRequest => ({
    newSlotId: data.slotId,
    newDay: data.day,
    newStartTime: data.startTime,
    newEndTime: data.endTime,
});
