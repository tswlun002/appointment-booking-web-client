import type {TypeError} from "~/domain/error/Error"
import {type Dispatch, useCallback, useEffect, useMemo, useReducer, useRef} from "react";
import {createZodResolver} from "~/model/auth/zod/ZodResolver";
import {type NavigateFunction, useLocation, useNavigate} from "react-router";
import type {UseMutationResult} from "@tanstack/react-query";
import {ViewModel} from "~/model/ViewModel";
import {type ActionDispatch, ActionEvent} from "~/model/ActionEvent";
import useAuthStore from "~/model/auth/zustand/AuthStore";
import {useShallow} from "zustand/react/shallow";
import {EmailVerificationSchema, type EmailVerificationState} from "~/domain/user/EmailVerification";
import {
    useVerifyUser,
    type VerifyUserMutationBody,
    type VerifyUserMutationError,
    type VerifyUserMutationResult
} from "~/api/user/generated/endpoints/registration/registration";
import type {TokenResponse, VerificationRequest} from "~/domain/user/generated/model";

const NAVIGATION_DELAY_TIME_SECOND = 1500;

export const useEmailVerificationModel = () => {
    const location = useLocation();

    // Access the state object
    const email: string | undefined = location.state?.registryEmail;
    const registerResponse: string | undefined = location.state?.responseMessage;
    const isCapitecClient: boolean | undefined = location.state?.isCapitecClient;

    const initialState = initialEmailVerificationState({ registryEmail: email, registerResponse: registerResponse, isCapitecClient: isCapitecClient });
    const reducer = ViewModel.reducer<VerifyUserMutationBody, VerifyUserMutationResult, EmailVerificationState>(initialState);

    const [state, dispatch] = useReducer(reducer, initialState);

    // Stable dispatch to prevent unnecessary re-renders
    const stableDispatch = useCallback((action: ActionDispatch<VerifyUserMutationBody, VerifyUserMutationResult>) => dispatch(action), []);

    // Use ref to always have latest state without triggering re-renders
    const stateRef = useRef(state);
    stateRef.current = state;

    const emailVerificationMutation = useVerifyUser();
    const navigateFunction = useNavigate();

    const resolver = useMemo(
        () => createZodResolver<VerifyUserMutationBody, TypeError<VerifyUserMutationBody>>(EmailVerificationSchema),
        []
    );

    const login = useAuthStore(useShallow(state => state.login));

    // Model only depends on stable references, not state
    const model = useMemo(
        () => new EmailVerificationModel(
            stateRef, stableDispatch, resolver,
            emailVerificationMutation, login, navigateFunction,
            initialState
        ),
        [stableDispatch, resolver, emailVerificationMutation, login, navigateFunction, initialState]
    );

    useEffect(() => {
        model.catchStateChange(state);
    }, [state?.response?.isSuccess]);

    return {
        state,
        model,
    };
};


export class EmailVerificationModel extends ViewModel<VerifyUserMutationBody, VerifyUserMutationResult, EmailVerificationState> {
    private emailVerificationInitialState: EmailVerificationState;

    constructor(
        private stateRef: React.RefObject<EmailVerificationState>,
        dispatch: Dispatch<ActionDispatch<VerifyUserMutationBody, VerifyUserMutationResult>>,
        resolver: (data: VerifyUserMutationBody) => Promise<{
            errors?: TypeError<VerifyUserMutationBody>;
            values?: VerifyUserMutationBody
        }>,
        private emailVerificationMutation: UseMutationResult<string | void | TokenResponse, VerifyUserMutationError, { data: VerificationRequest; }, unknown>,
        private login: (tokenResponse: TokenResponse) => Promise<void>,
        private navigateFunction: NavigateFunction,
        emailVerificationInitialState: EmailVerificationState,
    ) {
        super(stateRef.current, dispatch, resolver, emailVerificationInitialState);
        this.emailVerificationInitialState = emailVerificationInitialState;
    }

    // Override parent method - use mutateAsync with try/catch
    submitToAPI = async (emailVerification: VerifyUserMutationBody): Promise<void> => {
        try {
            const apiResponse = await this.emailVerificationMutation.mutateAsync({ data: emailVerification });

            let message: string;
            let status: number;

            if (apiResponse === undefined || typeof apiResponse === "string") {
                message = typeof apiResponse === "string" ? apiResponse : "Successfully verified, please login to book.";
                status = 202;
            } else {
                status = 200;
                await this.login(apiResponse);
                message = "Successfully verified, and auto logged in.";
            }

            this.dispatch({ type: ActionEvent.SET_API_RESPONSE_SUCCESS, isSuccess: true, message: message, status: status });
        } catch (error) {
            const mutationError = error as VerifyUserMutationError;
            console.debug(mutationError);
            const message = mutationError?.message || mutationError?.error || "Verification failed. Please try again.";
            this.dispatch({ type: ActionEvent.SET_API_ERROR, error: { isError: true, message: message } });
        }
    };

    catchStateChange(state: EmailVerificationState) {
        console.log(state);
        if (state.response?.isSuccess) {
            if (state.response.status === 200) {
                setTimeout(() => {
                    const navigateTo = "/appointments";
                    console.log("navigate to:", navigateTo);
                    this.navigateFunction(navigateTo, { replace: true });
                }, NAVIGATION_DELAY_TIME_SECOND);
            } else if (state.response.status === 202 || state.response.status === 204) {
                setTimeout(() => {
                    const navigateTo = "/";
                    console.log("navigate to:", navigateTo);
                    this.navigateFunction(navigateTo, { replace: true });
                }, NAVIGATION_DELAY_TIME_SECOND);
            }
        }
    }
}

type RegistrationResponse = {
    registryEmail?: string
    registerResponse?: string
    isCapitecClient?: boolean
}

export const initialEmailVerificationState = ({ registryEmail, registerResponse, isCapitecClient }: RegistrationResponse) => {
    return {
        userData: {
            email: registryEmail || "",
            otp: "",
            isCapitecClient: isCapitecClient,
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
        additionalData: {
            isSuccess: true,
            registrationResponseMessage: registerResponse
        }
    } as EmailVerificationState;
};
