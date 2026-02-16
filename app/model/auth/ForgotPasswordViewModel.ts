import type {TypeError} from "~/domain/error/Error"
import {type Dispatch, useEffect, useMemo, useReducer} from "react";
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


    useEffect(()=>{
        model.catchStateChange(state)
    }, [state.response?.isSuccess])

    const resolver = useMemo(
        () => createZodResolver<ForgotPasswordRequest, TypeError<ForgotPasswordRequest>>(ForgotPasswordSchema),
        []
    );

    const model = useMemo(
        () => new ForgotPasswordModel(state, dispatch, resolver, forgoPasswordMutation, navigateFunction,setEmailVerificationResponseMessage),
        [state, resolver]
    );

    return {
        state,
        model,
    };
};

export class ForgotPasswordModel extends ViewModel<ForgotPasswordRequest,RequestPasswordResetMutationResult, ForgotPasswordState>{

    constructor(
        protected state: ForgotPasswordState,
        protected dispatch: Dispatch<ActionDispatch<ForgotPasswordRequest,RequestPasswordResetMutationResult>>,
        protected resolver: Resolver,
        private forgoPasswordMutation:  UseMutationResult<RequestPasswordResetMutationResult, RequestPasswordResetMutationError, { data: ForgotPasswordRequest }, unknown>,
        private navigateFunction: NavigateFunction,
        private setEmailVerificationResponseMessage:  (data:{email: string, message: string}) => void
    ) {
        super(state,dispatch,resolver,initialForgotPasswordState)
    }
     submitToAPI = (data: ForgotPasswordRequest) => {
         this.forgoPasswordMutation?.mutateAsync({data:data}, this.forgoPasswordMutationOptions())
    };
    private forgoPasswordMutationOptions = () => {

        return {
            onSuccess: (data: RequestPasswordResetMutationResult) => {
                this.setEmailVerificationResponseMessage({message:data, email:this.state.userData.email});
                this.dispatch({type: ActionEvent.SET_API_RESPONSE_SUCCESS, message: data , isSuccess: true});

            },
            onError: (error: RequestPasswordResetMutationError) => {


                const message =  error.message || error.error;

                this.dispatch({type: ActionEvent.SET_API_ERROR, error: {isError: true, message: message }});
            },
        }
    }

    catchStateChange(state: ForgotPasswordState) {
        if (state.response?.isSuccess) {
                const path = "/password/reset";
                console.log("Navigate to :", path)
                this.navigateFunction(path,
                    {
                        replace: true,
                        state:{
                            email:this.state.userData.email,
                            prevResponseMessage:this.state.response?.message
                        }
                    });
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




