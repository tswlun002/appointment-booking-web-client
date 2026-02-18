import type {TypeError} from "~/domain/error/Error"
import React, {type Dispatch, type RefObject, useCallback, useEffect, useMemo, useReducer, useRef} from "react";
import {createZodResolver} from "~/model/auth/zod/ZodResolver";
import {type NavigateFunction, useNavigate} from "react-router";
import type {UseMutationResult} from "@tanstack/react-query";
import { ForgotPasswordSchema, type ForgotPasswordState} from "~/domain/user/ForgotPassword";
import {useShallow} from "zustand/react/shallow";
import {type ActionDispatch, ActionEvent} from "~/model/ActionEvent";
import {ViewModel} from "~/model/ViewModel";
import type {ForgotPasswordRequest} from "~/domain/user/generated/model";
import {
    type RequestPasswordResetMutationError, type RequestPasswordResetMutationResult,
    useRequestPasswordReset
} from "~/api/user/generated/endpoints/password-reset/password-reset";
import useAuthStore from "~/model/auth/zustand/AuthStore";

const SUCCESS_MESSAGE_DELAY_MS = 2000;

type Resolver =(data: ForgotPasswordRequest) => Promise<{
    values: ForgotPasswordRequest
    errors?: undefined
} | {
    errors: TypeError<ForgotPasswordRequest>
    values?: undefined
}>

export const useForgotPasswordModel = () => {

    const reducer = ViewModel.reducer<ForgotPasswordRequest,RequestPasswordResetMutationResult,ForgotPasswordState>(initialForgotPasswordState);
    const [state, dispatch] = useReducer(reducer, initialForgotPasswordState);
    const forgoPasswordMutation = useRequestPasswordReset();
    const navigateFunction = useNavigate();
    const setEmailVerificationResponseMessage  = useAuthStore(useShallow(state => state.setEmailVerificationResponseMessage));
    const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Stable dispatch - prevents unnecessary re-renders
    const stableDispatch = useCallback(
        (action: ActionDispatch<ForgotPasswordRequest, RequestPasswordResetMutationResult>) => dispatch(action),
        []
    );

    // Keep state fresh in ref for stable model instance
    const stateRef = useRef(state);
    stateRef.current = state;

    const resolver = useMemo(
        () => createZodResolver<ForgotPasswordRequest, TypeError<ForgotPasswordRequest>>(ForgotPasswordSchema),
        []
    );

    const model = useMemo(
        () => new ForgotPasswordModel(stateRef, stableDispatch, resolver, forgoPasswordMutation, navigateFunction, setEmailVerificationResponseMessage, navigationTimeoutRef),
        [stableDispatch, resolver, forgoPasswordMutation, navigateFunction, setEmailVerificationResponseMessage]
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

export class ForgotPasswordModel extends ViewModel<ForgotPasswordRequest,RequestPasswordResetMutationResult, ForgotPasswordState>{

    constructor(
        private stateRef: RefObject<ForgotPasswordState>,
        protected dispatch: Dispatch<ActionDispatch<ForgotPasswordRequest,RequestPasswordResetMutationResult>>,
        protected resolver: Resolver,
        private forgoPasswordMutation:  UseMutationResult<RequestPasswordResetMutationResult, RequestPasswordResetMutationError, { data: ForgotPasswordRequest }, unknown>,
        private navigateFunction: NavigateFunction,
        private setEmailVerificationResponseMessage:  (data:{email: string, message: string}) => void,
        private navigationTimeoutRef: RefObject<NodeJS.Timeout | null>
    ) {
        super(stateRef.current!,dispatch,resolver,initialForgotPasswordState)
    }

    /** Access current state from ref */
    private getCurrentState(): ForgotPasswordState {
        return this.stateRef.current!;
    }

    submitToAPI = async (data: ForgotPasswordRequest) => {
       await  this.forgoPasswordMutation?.mutateAsync({data:data}, this.forgoPasswordMutationOptions())
    };
    private forgoPasswordMutationOptions = () => {

        return {
            onSuccess: (data: RequestPasswordResetMutationResult) => {
                const currentState = this.getCurrentState();
                this.setEmailVerificationResponseMessage({message:data, email: currentState.userData.email});
                this.dispatch({type: ActionEvent.SET_API_RESPONSE_SUCCESS, message: data , isSuccess: true});

                // Show success message for 2 seconds, then navigate
                (this.navigationTimeoutRef as React.MutableRefObject<NodeJS.Timeout | null>).current = setTimeout(() => {
                    const path = "/password/reset";
                    this.navigateFunction(path, {
                        replace: true,
                        state: {
                            email: currentState.userData.email,
                            prevResponseMessage: data
                        }
                    });
                }, SUCCESS_MESSAGE_DELAY_MS);
            },
            onError: (error: RequestPasswordResetMutationError) => {

                const message =  error.message || error.error;

                this.dispatch({type: ActionEvent.SET_API_ERROR, error: {isError: true, message: message }});
            },
        }
    }
}

export const initialForgotPasswordState: ForgotPasswordState = {
    userData: {
        email: "",
    },
    errors: {
        email: {
            isError: false,
            message: ""
        },
        response: {
            isError: false,
            message: ""
        }
    },
    isLoading: false,
    response: {
        isSuccess: false,
    } ,
} ;




