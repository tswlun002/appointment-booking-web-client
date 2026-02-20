import { type Dispatch, useMemo, useReducer } from "react";
import { type NavigateFunction, useNavigate } from "react-router";
import type { UseMutationResult } from "@tanstack/react-query";
import useAuthStore from "~/model/auth/zustand/AuthStore";
import { useShallow } from "zustand/react/shallow";
import { ViewModel } from "~/model/ViewModel";
import { type ActionDispatch, ActionEvent } from "~/model/ActionEvent";
import { type LogoutMutationError, useLogout } from "~/api/auth/generated/endpoints/authentication/authentication";
import { type LogoutState, type LogoutRequest, type LogoutResponse, initialLogoutState } from "~/domain/auth/Logout";

/**
 * Hook for logout functionality
 * Follows the ModelView architecture pattern
 */
export const useLogoutModelView = () => {
    const reducer = ViewModel.reducer<LogoutRequest, LogoutResponse, LogoutState>(initialLogoutState);
    const [state, dispatch] = useReducer(reducer, initialLogoutState);

    const logoutMutation = useLogout();
    const navigateFunction = useNavigate();

    // Get zustand logout for frontend cleanup
    const zustandLogout = useAuthStore(useShallow(s => s.logout));

    const model = useMemo(
        () => new LogoutModelView(
            state,
            dispatch,
            logoutMutation,
            navigateFunction,
            zustandLogout
        ),
        [state, logoutMutation, navigateFunction, zustandLogout]
    );

    return {
        state,
        model,
    };
};

/**
 * LogoutModelView class
 * Handles logout business logic using React Query mutation
 */
export class LogoutModelView extends ViewModel<LogoutRequest, LogoutResponse, LogoutState> {

    constructor(
        protected state: LogoutState,
        protected dispatch: Dispatch<ActionDispatch<LogoutRequest, LogoutResponse>>,
        private logoutMutation: UseMutationResult<LogoutResponse, LogoutMutationError, void, unknown>,
        private navigateFunction: NavigateFunction,
        private zustandLogout: () => Promise<void>,
    ) {
        // Pass a no-op resolver since logout doesn't need validation
        super(state, dispatch, async () => ({ values: {} }), initialLogoutState);
    }

    /**
     * Execute logout - calls API then clears frontend state
     */
    handleLogout = (): void => {
        this.dispatch({ type: ActionEvent.SET_LOADING, isLoading: true });

        this.logoutMutation.mutateAsync(undefined, this.logoutMutationOptions())
            .catch(() => {
                // Error already handled in onError, but we still need to cleanup
            })
            .finally(() => {
                // Always cleanup frontend state regardless of API response
                this.cleanupAndNavigate();
            });
    };

    /**
     * Mutation options for logout
     */
    private logoutMutationOptions = () => {
        return {
            onSuccess: () => {
                this.dispatch({
                    type: ActionEvent.SET_API_RESPONSE_SUCCESS,
                    message: "Successfully logged out"
                });
            },
            onError: (error: LogoutMutationError) => {
                console.error("API logout failed:", error);
                this.dispatch({
                    type: ActionEvent.SET_API_ERROR,
                    error: {
                        isError: true,
                        message: error?.message || "Logout failed, clearing session"
                    }
                });
            },
        };
    };

    /**
     * Cleanup frontend state and navigate to login
     */
    private cleanupAndNavigate = async (): Promise<void> => {
        await this.zustandLogout();
        this.navigateFunction("/", { replace: true });
    };

    // Not used for logout but required by base class
    catchStateChange(_state: LogoutState): void {}
}

