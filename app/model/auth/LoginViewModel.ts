import type {TypeError} from "~/domain/error/Error"
import {type Dispatch, useCallback, useEffect, useMemo, useReducer, useRef} from "react";
import {createZodResolver} from "~/model/auth/zod/ZodResolver";
import {type NavigateFunction, useNavigate, useLocation, type Location} from "react-router";
import type {UseMutationResult} from "@tanstack/react-query";
import useAuthStore from "~/model/auth/zustand/AuthStore";
import {useShallow} from "zustand/react/shallow";
import {ViewModel} from "~/model/ViewModel";
import {type ActionDispatch, ActionEvent} from "~/model/ActionEvent";
import {type LoginMutationError, useLogin} from "~/api/auth/generated/endpoints/authentication/authentication";
import {LoginSchema, type LoginState} from "~/domain/auth/Login";
import type {LoginRequest, TokenResponse} from "~/domain/auth/generated/model";

export const useLoginModel = () => {

    const reducer = ViewModel.reducer<LoginRequest,TokenResponse,LoginState>(initialLoginState);
    const [state, dispatch] = useReducer(reducer, initialLoginState);

    // Stable dispatch to prevent unnecessary re-renders
    const stableDispatch = useCallback((action: ActionDispatch<LoginRequest, TokenResponse>) => dispatch(action), []);

    // Use ref to always have latest state without triggering re-renders
    const stateRef = useRef(state);
    stateRef.current = state;

    const loginMutation = useLogin();
    const navigateFunction = useNavigate();
    const location = useLocation();

    const login = useAuthStore(useShallow(state => state.login));

    const resolver = useMemo(
        () => createZodResolver<LoginRequest, TypeError<LoginRequest>>(LoginSchema),
        []
    );

    // Model only depends on stable references, not state
    const model = useMemo(
        () => new UserLoginModel(stateRef, stableDispatch, resolver, loginMutation, navigateFunction, login, location),
        [stableDispatch, resolver, loginMutation, navigateFunction, login, location]
    );

    useEffect(() => {
        model.catchStateChange(state);
    }, [state.response?.isSuccess]);

    return {
        state,
        model,
    };
};


export class UserLoginModel extends ViewModel<LoginRequest,TokenResponse,LoginState>{

    constructor(
        private stateRef: React.RefObject<LoginState>,
        protected dispatch: Dispatch<ActionDispatch<LoginRequest,TokenResponse>>,
        protected resolver: (data: LoginRequest) => Promise<{ errors?: TypeError<LoginRequest>; values?: LoginRequest }>,
        private loginMutation: UseMutationResult<TokenResponse, LoginMutationError, {data:LoginRequest}, unknown>,
        private navigateFunction: NavigateFunction,
        private login: (tokenResponse: TokenResponse) => void,
        private location: Location,
    ) {
        super(stateRef.current, dispatch, resolver, initialLoginState);
    }

    // Override parent method - use mutateAsync
    submitToAPI = async (data: LoginRequest): Promise<void> => {
        try {
            const response = await this.loginMutation.mutateAsync({ data });
            this.login(response);
            this.dispatch({ type: ActionEvent.SET_API_RESPONSE_SUCCESS, message: "Successfully logged in" });
        } catch (error) {
            const mutationError = error as LoginMutationError;
            console.log("Error: ", mutationError, "Status: ", mutationError.status);
            const message = (mutationError.status === 401)
                ? "Invalid email or password"
                : mutationError?.message || "Service currently unavailable, try again later";
            this.dispatch({ type: ActionEvent.SET_API_ERROR, error: { isError: true, message: message } });
        }
    };

    catchStateChange(state: LoginState) {
        if (state.response?.isSuccess) {
            // Navigate back to where user came from, or default to appointments
            const from = (this.location.state as { from?: { pathname: string } })?.from?.pathname || "appointments";
            this.navigateFunction(from, { replace: true });
        }
    }
}
export const initialLoginState: LoginState = {
    userData: {
        email: "",
        password: "",
    },
    errors: {
        email: {
            isError: false,
            message: ""
        },
        password: {
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
        data: {
            access_token: "",
            expires_in: 0,
            token_type: "",
            id_token: "",
            scope: ""
        },
    },
};
