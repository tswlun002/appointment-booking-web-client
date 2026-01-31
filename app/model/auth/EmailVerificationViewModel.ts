import type {TypeError} from "~/domain/error/Error"
import {type Dispatch, useEffect, useMemo, useReducer} from "react";
import {createZodResolver} from "~/model/auth/zod/ZodResolver";
import {type NavigateFunction, useLocation, useNavigate} from "react-router";
import type {UseMutationResult} from "@tanstack/react-query";
import {ViewModel} from "~/model/ViewModel";
import {type ActionDispatch, ActionEvent} from "~/model/ActionEvent";
import useAuthStore from "~/model/auth/zustand/auth-store";
import {useShallow} from "zustand/react/shallow";
import {EmailVerificationSchema, type EmailVerificationState} from "~/domain/user/EmailVerification";
import {
    useVerifyUser,
    type VerifyUserMutationBody,
    type VerifyUserMutationError,
    type VerifyUserMutationResult
} from "~/api/user/generated/endpoints/registration/registration";
import type {TokenResponse, VerificationRequest} from "~/domain/user/generated/model";

const NAVIGATION_DELAY_TIME_SECOND=1500

export const useEmailVerificationModel = () => {
    const location = useLocation();

    // Access the state object
    const email:string|undefined =location.state?.registryEmail;
    const registerResponse:string|undefined =location.state?.responseMessage;
    const isCapitecClient: boolean|undefined =  location.state?.isCapitecClient;

    const initialState= initialEmailVerificationState({registryEmail:email, registerResponse:registerResponse,isCapitecClient:isCapitecClient});
    const reducer = ViewModel.reducer<VerifyUserMutationBody, VerifyUserMutationResult, EmailVerificationState>(initialState)


    const [state, dispatch] =useReducer(reducer, initialState);
    const emailVerificationMutation = useVerifyUser();
    const navigateFunction = useNavigate();


    const resolver = useMemo(
        () => createZodResolver<VerifyUserMutationBody, TypeError<VerifyUserMutationBody>>(EmailVerificationSchema),
        []
    );
    const login = useAuthStore(useShallow(state => state.login));

    useEffect(()=>{
        model.catchStateChange(state);
    },[state?.response?.isSuccess])

    const model = useMemo(
        () => new EmailVerificationModel(
            state, dispatch, resolver,
            emailVerificationMutation,login, navigateFunction
            ,email,registerResponse,isCapitecClient
        ),
        [state, resolver]
    );

    return {
        state,
        model,
    };
};


export class EmailVerificationModel extends ViewModel<VerifyUserMutationBody, VerifyUserMutationResult, EmailVerificationState>{

    constructor(
        protected state: EmailVerificationState,
        protected dispatch: Dispatch<ActionDispatch<VerifyUserMutationBody>>,
        protected resolver: (data: VerifyUserMutationBody) => Promise<{
            errors?: TypeError<VerifyUserMutationBody>;
            values?: VerifyUserMutationBody
        }>,
        private emailVerificationMutation:  UseMutationResult<string | void | TokenResponse, VerifyUserMutationError, { data: VerificationRequest; }, unknown>,
        private login: (tokenResponse: TokenResponse) => Promise<void>,
        private navigateFunction: NavigateFunction,
        registryEmail?:string,
        registerResponse?:string,
        isCapitecClient?:boolean,
    ) {
        super(state, dispatch, resolver, initialEmailVerificationState({registryEmail:registryEmail, registerResponse:registerResponse,isCapitecClient:isCapitecClient}));
    }
    submitToAPI = (emailVerification: VerifyUserMutationBody) => {
      return   this.emailVerificationMutation?.mutateAsync({data:emailVerification}, this.emailVerificationMutationOptions())

    };
    private emailVerificationMutationOptions = () => {

        return {
            onSuccess: async (response: string | void | TokenResponse) => {

                console.log(response);
                let message;
                let status;
                if (typeof response === "string" || typeof response === "undefined") {
                    message = "Successfully verified, please login to book.";
                    status = 202
                } else {
                    status = 200;
                    await this.login(response);
                    console.log("Successfully verified, and auto logged in.");
                    message = "Successfully verified, and auto logged in.";
                }

                this.dispatch({
                    type: ActionEvent.SET_API_RESPONSE_SUCCESS,
                    isSuccess: true,
                    status: status,
                    message: message
                });

            },
            onError: (error: VerifyUserMutationError) => {
                console.debug(error);
                const message = error?.message || error?.error;
                this.dispatch({type: ActionEvent.SET_API_ERROR, error: {isError: true, message: message}});
            },

        }
    }

    catchStateChange(state: EmailVerificationState) {

        if (state.response?.isSuccess) {

            switch (state.response.status) {
                case 200: {
                    setTimeout(() => {
                        const navigateTo = "/block-posts"
                        console.log("navigate to:", navigateTo)
                        this.navigateFunction(navigateTo, {replace: true});
                    }, NAVIGATION_DELAY_TIME_SECOND);
                    break;
                }
                case  2002: {
                    setTimeout(() => {
                        const navigateTo = "login"
                        console.log("navigate to:", navigateTo)
                        this.navigateFunction(navigateTo, {replace: true});
                    }, 16000);
                    break;
                }
            }

        }
    }
}

type RegistrationResponse = {
    registryEmail?:string
    registerResponse?:string
    isCapitecClient?:boolean
}

export const initialEmailVerificationState =( {registryEmail, registerResponse,isCapitecClient}:RegistrationResponse)=> {
    return {
    userData: {
        email: registryEmail||"",
        otp: "",
        isCapitecClient:isCapitecClient,
    },
    errors: {
        email: {
            isError: false,
            message: ""
        },
        otp: {
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
        isSuccess: true,
        data: registerResponse
    }
} as EmailVerificationState

};


