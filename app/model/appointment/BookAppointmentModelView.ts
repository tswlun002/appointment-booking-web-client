import { ViewModel } from "~/model/ViewModel";
import {
    BookAppointmentSchema,
    SERVICE_TYPES,
    type BookAppointmentData,
    type BookAppointmentState,
} from "~/domain/appointment/BookAppointment";
import type { AppointmentResponse, CreateAppointmentRequest } from "~/domain/appointment/generated/model";
import { type Dispatch, type MouseEvent, useEffect, useMemo, useReducer } from "react";
import { type NavigateFunction, useLocation, useNavigate, useParams } from "react-router";
import type { TypeError } from "~/domain/error/Error";
import { createZodResolver } from "~/model/auth/zod/ZodResolver";
import { type ActionDispatch, ActionEvent } from "~/model/ActionEvent";
import {
    type CreateAppointmentMutationError,
    useCreateAppointment,
} from "~/api/appointment/generated/endpoints/customer-appointments/customer-appointments";
import type { UseMutationResult } from "@tanstack/react-query";
import useAuthStore from "~/model/auth/zustand/AuthStore";
import { useShallow } from "zustand/react/shallow";

type Resolver = (data: BookAppointmentData) => Promise<
    | { values: BookAppointmentData; errors?: undefined }
    | { errors: TypeError<BookAppointmentData>; values?: undefined }
>;

interface BookAppointmentInitProps {
    slotId: string;
    branchId: string;
    branchName: string;
    day: string;
    startTime: string;
    endTime: string;
    displayDate: string;
    slotTime: string;
}


export const useBookAppointmentModelView = () => {
    // Get branchId and slotId from route params
    const { branchId: routeBranchId, slotId: routeSlotId } = useParams();

    // Get additional booking data from navigation state (passed from slots page)
    const locationState = useLocation().state || {};
    const {
        slotId,
        branchId,
        branchName,
        day,
        startTime,
        endTime,
        displayDate,
        slotTime,
    } = locationState;

    // Use route params as fallback if state is missing
    const initProps = {
        slotId: slotId ?? routeSlotId ?? "",
        branchId: branchId ?? routeBranchId ?? "",
        branchName: branchName ?? "",
        day: day ?? "",
        startTime: startTime ?? "",
        endTime: endTime ?? "",
        displayDate: displayDate ?? "",
        slotTime: slotTime ?? "",
    };

    const reducer = ViewModel.reducer<BookAppointmentData, AppointmentResponse, BookAppointmentState>(initialBookAppointmentState);
    const [state, dispatch] = useReducer(reducer, initBookAppointment(initProps));

    const navigateFunction = useNavigate();

    // Get username from auth store
    const username = useAuthStore(useShallow((s) => s.user?.username ?? ""));

    // Create appointment mutation
    const createAppointmentMutation = useCreateAppointment();

    const resolver = useMemo(
        () => createZodResolver<BookAppointmentData, TypeError<BookAppointmentData>>(BookAppointmentSchema),
        []
    );

    const model = useMemo(
        () =>
            new BookAppointmentModelView(
                state,
                dispatch,
                resolver,
                createAppointmentMutation,
                navigateFunction,
                username
            ),
        [state]
    );

    // Open modal on mount
    useEffect(() => {
        model.openModal();
    }, []);

    // Handle state changes (e.g., navigate on success)
    useEffect(() => {
        model.catchStateChange(state);
    }, [state.response?.isSuccess]);

    return {
        state,
        model,
        serviceTypes: SERVICE_TYPES,
    };
};

export class BookAppointmentModelView extends ViewModel<BookAppointmentData, AppointmentResponse, BookAppointmentState> {
    constructor(
        protected state: BookAppointmentState,
        protected dispatch: Dispatch<ActionDispatch<BookAppointmentData, AppointmentResponse>>,
        protected resolver: Resolver,
        private createAppointmentMutation: UseMutationResult<AppointmentResponse, CreateAppointmentMutationError, { data: CreateAppointmentRequest }, unknown>,
        private navigateFunction: NavigateFunction,
        private customerUsername: string
    ) {
        super(state, dispatch, resolver, initialBookAppointmentState);
    }

    /** Open modal */
    openModal = (): void => {
        this.dispatch({ type: ActionEvent.TOGGLE_MODAL, field: "isModalOpen", value: true });
    };

    /** Close modal and reset service type */
    closeModal = (): void => {
        this.dispatch({ type: ActionEvent.TOGGLE_MODAL, field: "isModalOpen", value: false });
        this.dispatch({ type: ActionEvent.SET_FIELD, field: "serviceType", value: "" });
    };

    /** Handle service type selection */
    selectServiceType = (serviceType: string, event: MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        this.dispatch({ type: ActionEvent.SET_FIELD, field: "serviceType", value: serviceType });
    };


    /** Check if form is valid for submission */
    isConfirmEnabled = (): boolean => {
        return this.state.userData.serviceType.length > 0 && !this.state.isLoading;
    };

    /** Convert BookAppointmentData to CreateAppointmentRequest */
    private toCreateAppointmentRequest = (data: BookAppointmentData): CreateAppointmentRequest => ({
        slotId: data.slotId,
        branchId: data.branchId,
        customerUsername: data.customerUsername,
        serviceType: data.serviceType,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
    });

    /** Submit booking to API */
    submitToAPI = (data: BookAppointmentData): Promise<AppointmentResponse> => {
        const requestData = this.toCreateAppointmentRequest(data);
        return this.createAppointmentMutation.mutateAsync({ data: requestData }, this.mutationOptions());
    };

    private mutationOptions = () => {
        return {
            onSuccess: (response: AppointmentResponse) => {
                this.dispatch({
                    type: ActionEvent.SET_API_RESPONSE_SUCCESS,
                    message: "Appointment booked successfully",
                    data: response,
                });
            },
            onError: (error: CreateAppointmentMutationError) => {
                const message = error?.message || "Failed to book appointment. Please try again.";
                this.dispatch({
                    type: ActionEvent.SET_API_ERROR,
                    error: { isError: true, message, status: error?.status },
                });
            },
        };
    };

    /** Confirm booking */
    confirmBooking = (event: MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();

        // Validate service type is selected
        if (!this.state.userData.serviceType) {
            this.dispatch({
                type: ActionEvent.SET_ERROR,
                errors: {
                    ...this.state.errors,
                    serviceType: { isError: true, message: "Please select a service type" },
                },
            });
            return;
        }

        // Set loading and submit
        this.dispatch({ type: ActionEvent.SET_LOADING, isLoading: true });
        this.submitToAPI({
            ...this.state.userData,
            customerUsername: this.customerUsername,
        });
    };

    /** Handle state changes - navigate on success */
    catchStateChange = (state: BookAppointmentState): void => {
        if (state.response?.isSuccess && state.response.data) {
            this.closeModal();
            // Navigate to appointment confirmation/success page
            this.navigateFunction("/appointments/success", {
                state: {
                    appointment: state.response.data,
                },
                replace: true,
            });
        }
    };
}


const initialBookAppointmentState: BookAppointmentState = {
    isLoading: false,
    errors: {
        serviceType: { isError: false },
        slotId: { isError: false },
        branchId: { isError: false },
        branchName: { isError: false },
        customerUsername: { isError: false },
        day: { isError: false },
        startTime: { isError: false },
        endTime: { isError: false },
        slotTime: { isError: false },
        displayDate: { isError: false },
        isModalOpen: { isError: false },
        response: { isError: false },
    },
    userData: {
        serviceType: "",
        slotId: "",
        branchId: "",
        branchName: "",
        customerUsername: "",
        day: "",
        startTime: "",
        endTime: "",
        displayDate: "",
        slotTime: "",
        isModalOpen: false,
    },
};

/**
 * Initialize state with branch and slot data that's already selected.
 * Only serviceType remains empty - user will select it in the modal.
 */
const initBookAppointment = (props: BookAppointmentInitProps): BookAppointmentState => ({
    isLoading: false,
    errors: {
        serviceType: { isError: false },
        slotId: { isError: false },
        branchId: { isError: false },
        branchName: { isError: false },
        customerUsername: { isError: false },
        day: { isError: false },
        startTime: { isError: false },
        endTime: { isError: false },
        slotTime: { isError: false },
        displayDate: { isError: false },
        isModalOpen: { isError: false },
        response: { isError: false },
    },
    userData: {
        // Already selected - from branch selection
        branchId: props.branchId,
        branchName: props.branchName,
        // Already selected - from slot selection
        slotId: props.slotId,
        day: props.day,
        startTime: props.startTime,
        endTime: props.endTime,
        displayDate: props.displayDate,
        slotTime: props.slotTime,
        // Will be set from auth store
        customerUsername: "",
        // User selects in modal - starts empty
        serviceType: "",
        // Modal state
        isModalOpen: false,
    },
});
