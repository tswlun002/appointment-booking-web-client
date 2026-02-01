import type {TypeError} from "~/domain/error/Error"
import {type Dispatch, useEffect, useMemo, useReducer} from "react";
import {createZodResolver} from "~/model/auth/zod/ZodResolver";
import {type NavigateFunction, useNavigate} from "react-router";
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

    const loginMutation = useLogin();
    const navigateFunction = useNavigate();

    const login = useAuthStore(useShallow(state => state.login));

    const resolver = useMemo(
        () => createZodResolver<LoginRequest, TypeError<LoginRequest>>(LoginSchema),
        []
    );

    const model = useMemo(
        () => new UserLoginModel(state, dispatch, resolver, loginMutation, navigateFunction, login),
        [state]
    );

    useEffect(() => {

            model.catchStateChange(state);
    }, [state.response?.isSuccess])

    return {
        state,
        model,
    };
};


export class UserLoginModel extends ViewModel<LoginRequest,TokenResponse,LoginState>{

    constructor(
        protected state: LoginState,
        protected dispatch: Dispatch<ActionDispatch<LoginRequest>>,
        protected resolver: (data: LoginRequest) => Promise<{ errors?: TypeError<LoginRequest>; values?: LoginRequest }>,
        private loginMutation:  UseMutationResult<TokenResponse, LoginMutationError, {data:LoginRequest}, unknown>,
        private navigateFunction: NavigateFunction,
        private login: (tokenResponse: TokenResponse) => void,
    ) {
        super(state,dispatch,resolver,initialLoginState);
    }

    //Override parent method
     submitToAPI = (data: LoginRequest):void => {

            this.loginMutation?.mutate({data:data}, this.loginMutationOptions());
    };
    private loginMutationOptions = () => {

        return {
            onSuccess: (data: TokenResponse) => {
                this.login(data);
                this.dispatch({type: ActionEvent.SET_API_RESPONSE_SUCCESS, message: "success logged in"});

            },
            onError: (error: LoginMutationError) => {
                console.log("Error: ", error,"Status: ", error.status);
                const message = (error.status ===401)?"Invalid email or password" : error?.message;
                this.dispatch({type: ActionEvent.SET_API_ERROR, error: {isError: true, message: message}});
            },
        }
    }

    catchStateChange(state: LoginState) {

        if (state.response?.isSuccess) {
            const path = "branches";
            console.log("Navigate to :", path)
            this.navigateFunction(path, { replace: true});
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



