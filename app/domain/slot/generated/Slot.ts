import {
    getWeeklySlotsParams,
    getWeeklySlotsPathBranchIdMax,
    getWeeklySlotsPathBranchIdMin, getWeeklySlotsQueryParams
} from "~/domain/slot/generated/zod";
import {z} from "zod";
import type {State} from "~/domain/State";
import type {GetWeeklySlotsParams, SlotsResponse} from "~/domain/slot/generated/model";

export const WeeklySlotsRequestDataSchema = getWeeklySlotsParams.extend({
    branchId: z
        .string({error:"Invalid branch id"})
        .min(getWeeklySlotsPathBranchIdMin)
        .max(getWeeklySlotsPathBranchIdMax),
    ...getWeeklySlotsQueryParams.extend({
        fromDate: z.iso
            .date({error: "Invalid slot date"})
            .optional(),
        status: z
            .enum(["AVAILABLE", "FULLY_BOOKED", "BLOCKED", "EXPIRED"])
            .optional(),
    }),
    selectedSlotId:z.string({error:"slot is required"})
        .min(5),
    serviceTYpe:z.enum(["Loan/Credit Services", "Account/Card Services","Business Banking", "Disputes & Queries", "Other"])
});

export type WeeklySlotsQuery = GetWeeklySlotsParams&{
    branchId:string,
    selectedSlotId?:string,
    serviceType?:string,
}

/** Reschedule mode navigation state */
export interface RescheduleNavigationState {
    mode: 'reschedule';
    appointmentId: string;
    serviceType: string;
    branchName: string;
    currentDateTime: string;
    rescheduleCount: number;
    distance: string;
    haveSlotBookedInFuture:boolean
}

export interface WeeklySlotsState extends State<WeeklySlotsQuery, SlotsResponse>{
    branchName: string;
    distance: string;
    // Reschedule mode data
    isRescheduleMode: boolean;
    haveSlotBookedInFuture: boolean;
    rescheduleData?: {
        appointmentId: string;
        serviceType: string;
        currentDateTime: string;
        rescheduleCount: number;
    };
}
