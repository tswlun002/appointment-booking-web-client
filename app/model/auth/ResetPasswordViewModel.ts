import type {Error, TypeError} from "~/domain/error/Error"
import React, {type ChangeEvent, type Dispatch, type RefObject, useCallback, useEffect, useMemo, useReducer, useRef} from "react";
import {createZodResolver} from "~/model/auth/zod/ZodResolver";
import {type NavigateFunction, useNavigate} from "react-router";
import type {UseMutationResult} from "@tanstack/react-query";
import {useShallow} from "zustand/react/shallow";
import {ViewModel} from "~/model/ViewModel";
import {type ActionDispatch, ActionEvent} from "~/model/ActionEvent";
import useAuthStore from "~/model/auth/zustand/AuthStore";
import type {PasswordResetRequest} from "~/domain/user/generated/model";
import {ResetPasswordSchema, type ResetPasswordState} from "~/domain/user/ResetPassword";
import {
    type ResetPasswordMutationError,
    useResetPassword
} from "~/api/user/generated/endpoints/password-reset/password-reset";
import {isNotBlank} from "~/utils/CompanionObjects";
import type {
    RequestPasswordChangeMutationResult
} from "~/api/user/generated/endpoints/password-management/password-management";

const VALIDATION_DELAY_TIME_SECOND = 1500;
const SUCCESS_MESSAGE_DELAY_MS = 2000;

type Resolver=(data: PasswordResetRequest) => Promise<{
    values: PasswordResetRequest
    errors?: undefined
} | {
    errors: TypeError<PasswordResetRequest>
    values?: undefined
}>

export const useResetPasswordViewModel  = () => {


    const {email,message}= useAuthStore(useShallow(state=>{
        return{message:state.emailVerificationResponseMessage,email:state.user?.email}
    }))

    const initialState = useMemo(() => ({
        ...initialResetPasswordState,
        userData: {
            ...initialResetPasswordState.userData,
            email: email || ""
        },
        instructionMessage: message || ""
    }), [email, message]);

    const reducer = ViewModel.reducer<PasswordResetRequest,RequestPasswordChangeMutationResult,ResetPasswordState>(initialResetPasswordState);
    const [state, dispatch] = useReducer(reducer, initialState);
    const resetPasswordMutation = useResetPassword();
    const navigateFunction = useNavigate();
    const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Stable dispatch - prevents unnecessary re-renders
    const stableDispatch = useCallback(
        (action: ActionDispatch<PasswordResetRequest, RequestPasswordChangeMutationResult>) => dispatch(action),
        []
    );

    // Keep state fresh in ref for stable model instance
    const stateRef = useRef(state);
    stateRef.current = state;

    const resolver = useMemo(() => createZodResolver<PasswordResetRequest, TypeError<PasswordResetRequest>>(ResetPasswordSchema), []);

    const model = useMemo(
        () => new ResetPasswordModel(stateRef, stableDispatch, resolver, resetPasswordMutation, navigateFunction, navigationTimeoutRef),
        [stableDispatch, resolver, resetPasswordMutation, navigateFunction]
    );

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (navigationTimeoutRef.current) {
                clearTimeout(navigationTimeoutRef.current);
            }
        };
    }, []);

    return {
        state,
        model,
    };
};


export class ResetPasswordModel extends ViewModel<PasswordResetRequest,RequestPasswordChangeMutationResult,ResetPasswordState> {

    constructor(
        private stateRef: RefObject<ResetPasswordState>,
        protected dispatch: Dispatch<ActionDispatch<PasswordResetRequest, RequestPasswordChangeMutationResult>>,
        protected resolver: Resolver,
        private resetPasswordMutation:  UseMutationResult<RequestPasswordChangeMutationResult, ResetPasswordMutationError, { data: PasswordResetRequest }, unknown>,
        private navigateFunction: NavigateFunction,
        private navigationTimeoutRef: RefObject<NodeJS.Timeout | null>
    ) {
        super(stateRef.current!, dispatch, resolver, initialResetPasswordState);
    }

    /** Access current state from ref */
    private getCurrentState(): ResetPasswordState {
        return this.stateRef.current!;
    }

    onChange = async (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        const field = event.target.id as keyof PasswordResetRequest;
        const value = event.target.value;

        // Use base class clearTimeout pattern
        this.clearTimeout();
        this.validationTimeout = setTimeout(() => this.validateForm(field, value), VALIDATION_DELAY_TIME_SECOND);
        this.dispatch({type: ActionEvent.SET_FIELD, field, value});
    };

    private getError = (errorKey: string, error: Error): TypeError<PasswordResetRequest> => {
        const passwordErrors: Record<keyof TypeError<PasswordResetRequest>, Error> = {} as TypeError<PasswordResetRequest>;

        const confirmPassword = "confirmPassword";
        const password = "newPassword";

        if (errorKey == password) {
            passwordErrors[errorKey] = error;
            passwordErrors[confirmPassword] = error;
        } else if (errorKey == confirmPassword) {
            passwordErrors[errorKey] = error;
            passwordErrors[password] = error;
        } else {
            passwordErrors[errorKey as keyof TypeError<PasswordResetRequest>] = error;
        }

        return passwordErrors;
    }

    protected validateForm = async (key: string, value: string | number): Promise<Boolean> => {
        const currentState = this.getCurrentState();
        const data = {...currentState.userData, [key]: value};
        const result = await this.resolver(data);

        const errorKey = key as keyof TypeError<PasswordResetRequest>;

        if (isNotBlank<TypeError<PasswordResetRequest>>(result.errors) && result.errors !== undefined) {
            const error = result.errors[errorKey];
            const notBlank = isNotBlank<Error>(error);

            const passwordErrors = notBlank
                ? this.getError(errorKey, error)
                : this.getError(errorKey, initialResetPasswordState.errors[errorKey]);

            this.dispatch({type: ActionEvent.SET_ERROR, errors: {...currentState.errors, ...passwordErrors}});
            return false;
        } else {
            this.dispatch({type: ActionEvent.CLEAR_ERRORS});
            return true;
        }
    };

    public submitToAPI = async (data: PasswordResetRequest) => {
        await this.resetPasswordMutation?.mutateAsync({data}, this.resetPasswordMutationOptions());
    };

    private resetPasswordMutationOptions = () => {
        return {
            onSuccess: (data: RequestPasswordChangeMutationResult) => {
                this.dispatch({
                    type: ActionEvent.SET_API_RESPONSE_SUCCESS,
                    isSuccess: true,
                    message: data
                });

                // Show success message, then navigate
                (this.navigationTimeoutRef as React.MutableRefObject<NodeJS.Timeout | null>).current = setTimeout(() => {
                    const navigateTo = "/";
                    this.navigateFunction(navigateTo, {replace: true});
                }, SUCCESS_MESSAGE_DELAY_MS);
            },
            onError: (error: ResetPasswordMutationError) => {
                const message = error.message || error.error;
                this.dispatch({
                    type: ActionEvent.SET_API_ERROR,
                    error: {isError: true, message: message}
                });
            },
        }
    }
}



 const initialResetPasswordState: ResetPasswordState = {
    userData: {
        email: "",
        OTP: "",
        newPassword: "",
        confirmPassword: ""
    },
    instructionMessage: "",
    errors: {
        email: {
            isError: false,
            message: ""
        },
        OTP: {
            isError: false,
            message: ""
        },
        response: {
            isError: false,
            message: ""
        },
        newPassword: {
            isError: false,
            message: ""
        },
        confirmPassword: {
            isError: false,
            message: ""
        }
    },
    isLoading: false,
};




