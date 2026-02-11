import type {Error, TypeError} from "~/domain/error/Error"
import {type ChangeEvent, type Dispatch, useCallback, useEffect, useMemo, useReducer, useRef} from "react";
import {createZodResolver} from "~/model/auth/zod/ZodResolver";
import {isNotBlank} from "~/utils/CompanionObjects";
import type {UseMutationResult} from "@tanstack/react-query";
import {type NavigateFunction, useNavigate} from "react-router";
import {ViewModel} from "~/model/ViewModel";
import {type ActionDispatch, ActionEvent} from "~/model/ActionEvent";
import {
    type RegisterUserMutationBody,
    type RegisterUserMutationError, type RegisterUserMutationResult,
    useRegisterUser
} from "~/api/user/generated/endpoints/registration/registration";
import {type RegisterState, registerUserSchema} from "~/domain/user/Register";


const VALIDATION_DELAY_TIME_SECOND = 1500;
const NAVIGATION_DELAY_TIME_SECOND = 1500;

export const useRegisterModel = () => {

    const reducer = ViewModel.reducer<RegisterUserMutationBody, RegisterUserMutationResult, RegisterState>(initialRegisterState);
    const [state, dispatch] = useReducer(reducer, initialRegisterState);

    // Stable dispatch to prevent unnecessary re-renders
    const stableDispatch = useCallback((action: ActionDispatch<RegisterUserMutationBody, RegisterUserMutationResult>) => dispatch(action), []);

    // Use ref to always have latest state without triggering re-renders
    const stateRef = useRef(state);
    stateRef.current = state;

    const registerMutation = useRegisterUser();
    const navigateFunction = useNavigate();

    const resolver = useMemo(
        () => createZodResolver<RegisterUserMutationBody, TypeError<RegisterUserMutationBody>>(registerUserSchema),
        []
    );

    // Model only depends on stable references, not state
    const model = useMemo(
        () => new RegisterModel(stateRef, stableDispatch, resolver, registerMutation, navigateFunction),
        [stableDispatch, resolver, registerMutation, navigateFunction]
    );

    useEffect(() => {
        model.catchStateChange(state);
    }, [state?.response?.isSuccess]);

    return {
        state,
        model,
    };
};


export class RegisterModel extends ViewModel<RegisterUserMutationBody, RegisterUserMutationResult, RegisterState> {

    constructor(
        private stateRef: React.RefObject<RegisterState>,
        protected dispatch: Dispatch<ActionDispatch<RegisterUserMutationBody, RegisterUserMutationResult>>,
        protected resolver: (data: RegisterUserMutationBody) => Promise<{ errors?: TypeError<RegisterUserMutationBody>; values?: RegisterUserMutationBody }>,
        private registerMutation: UseMutationResult<RegisterUserMutationResult, RegisterUserMutationError, { data: RegisterUserMutationBody }, unknown>,
        private navigateFunction: NavigateFunction
    ) {
        super(stateRef.current, dispatch, resolver, initialRegisterState);
    }

    // Get current state from ref
    private getCurrentState(): RegisterState {
        return this.stateRef.current;
    }

    onChange = async (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        const key = event.target.id as keyof RegisterUserMutationBody;
        const value = event.target.value;

        this.clearTimeout();
        // Schedule new validation with the latest value
        this.validationTimeout = setTimeout(() => this.validateForm(key, value), VALIDATION_DELAY_TIME_SECOND);

        this.dispatch({ type: ActionEvent.SET_FIELD, field: key, value });
    };

    private getError = (errorKey: string, error: Error): TypeError<RegisterUserMutationBody> => {
        const passwordErrors: Record<keyof TypeError<RegisterUserMutationBody>, Error> = {} as TypeError<RegisterUserMutationBody>;

        const confirmPassword = "confirmPassword";
        const password = "password";

        if (errorKey == password) {
            passwordErrors[errorKey] = error;
            passwordErrors[confirmPassword] = error;
        } else if (errorKey == confirmPassword) {
            passwordErrors[errorKey] = error;
            passwordErrors[password] = error;
        } else {
            passwordErrors[errorKey as keyof TypeError<RegisterUserMutationBody>] = error;
        }

        return passwordErrors;
    };

    protected validateForm = async (key: string, value: string | number): Promise<Boolean> => {
        const currentState = this.getCurrentState();
        const data = { ...currentState.userData, [key]: value };
        const result = await this.resolver(data);
        const errorKey = key as keyof TypeError<RegisterUserMutationBody>;

        if (isNotBlank<TypeError<RegisterUserMutationBody>>(result.errors) && result.errors !== undefined) {
            const error = result.errors[errorKey];
            const notBlank = isNotBlank<Error>(error);

            const passwordErrors = notBlank
                ? this.getError(errorKey, error)
                : this.getError(errorKey, initialRegisterState.errors[errorKey]);

            this.dispatch({ type: ActionEvent.SET_ERROR, errors: { ...currentState.errors, ...passwordErrors } });
            return false;
        } else {
            this.dispatch({ type: ActionEvent.CLEAR_ERRORS });
            return true;
        }
    };

    // Override parent method - use mutateAsync with try/catch
    public submitToAPI = async (userRegister: RegisterUserMutationBody): Promise<void> => {
        try {
            const response = await this.registerMutation.mutateAsync({ data: userRegister });
            this.dispatch({ type: ActionEvent.SET_API_RESPONSE_SUCCESS, isSuccess: true, message: response });
        } catch (error) {
            const mutationError = error as RegisterUserMutationError;
            console.info(mutationError.message, mutationError.error, "\n", mutationError);
            const message = mutationError.message || mutationError.error || "Registration failed. Please try again.";
            this.dispatch({ type: ActionEvent.SET_API_ERROR, error: { isError: true, message: message } });
        }
    };

    catchStateChange(state: RegisterState) {
        if (state.response?.isSuccess) {
            const currentState = this.getCurrentState();
            setTimeout(() => {
                const emailVerification = "email-verification";
                this.navigateFunction(
                    emailVerification,
                    {
                        replace: true,
                        state: {
                            registryEmail: currentState.userData.email,
                            responseMessage: currentState.response?.data || "Check verification code your email",
                            isCapitecClient: currentState.userData?.isCapitecClient,
                        }
                    }
                );
            }, NAVIGATION_DELAY_TIME_SECOND);
        }
    }

    onToggle(key: string) {
        const currentState = this.getCurrentState();
        const field = key as keyof RegisterUserMutationBody;
        const value = !currentState.userData.isCapitecClient;
        this.dispatch({ type: ActionEvent.TOGGLE_MODAL, field: field, value: value });
    }
}

const createDefaultError = (): Error => ({ isError: false, message: '' });

export const initialRegisterState: RegisterState = {
    userData: {
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: '',
        idNumber: '',
        isCapitecClient: true
    },
    errors: Object.fromEntries(
        ['firstname', 'lastname', 'email', 'password', 'confirmPassword', 'response', 'idNumber', 'isCapitecClient']
            .map(key => [key, createDefaultError()])
    ) as TypeError<RegisterUserMutationBody>,
    isLoading: false,
};

