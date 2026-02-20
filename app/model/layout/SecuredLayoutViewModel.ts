import {useLocation, useNavigate} from "react-router";
import useAuthStore from "~/model/auth/zustand/AuthStore";
import {useShallow} from "zustand/react/shallow";
import {useCallback, useEffect, useMemo, useState} from "react";
import {SECURED_PAGE_ROLES} from "~/domain/role/Roles";
import {USERNAME_REGEX} from "~/domain/user/User";
import {useLogoutModelView} from "~/model/auth/LogoutModelView";

const HYDRATION_TIMEOUT_MS = 10000;

export const useSecuredLayoutModel = () => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [hydrationTimedOut, setHydrationTimedOut] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    // Use LogoutModelView for logout functionality (authenticated users)
    const { model: logoutModel } = useLogoutModelView();

    const {isAuthenticated, roles, username, logout} = useAuthStore(useShallow((state) => ({
        isAuthenticated: state.isAuthenticated,
        roles: state.roles,
        username: state.user?.username,
        logout: state.logout,
    })));

    const normalizedSecuredRoles = useMemo(
        () => SECURED_PAGE_ROLES.map(s => s.trim().toLowerCase()),
        []
    );

    const hasMatchingRole = useCallback((userRoles: string[] | undefined) => {
        if (!userRoles || userRoles.length === 0) return false;
        return userRoles.some(role =>
            normalizedSecuredRoles.includes(role.toLowerCase())
        );
    }, [normalizedSecuredRoles]);

    /** Handle unauthorized access - calls LogoutModelView if authenticated, frontend logout otherwise */
    const handleUnauthorizedAccess = useCallback(async (errorMessage?: string) => {
        try {
            if (isAuthenticated) {
                // User was authenticated but failed validation - call API logout via LogoutModelView
                logoutModel.handleLogout();
            } else {
                // User was never authenticated - just clear frontend and navigate
                await logout();
                navigate("/", {
                    replace: true,
                    state: {
                        from: location,
                        error: errorMessage || "Please login to continue."
                    }
                });
            }
        } catch (error) {
            // If anything fails, force cleanup and navigate
            console.error("Logout failed during unauthorized access handling:", error);
            useAuthStore.persist.clearStorage();
            navigate("/", {
                replace: true,
                state: {
                    from: location,
                    error: errorMessage || "Session expired. Please login again."
                }
            });
        }
    }, [isAuthenticated, logout, logoutModel, navigate, location]);

    useEffect(() => {
        if (useAuthStore.persist.hasHydrated()) {
            setIsHydrated(true);
            return;
        }

        const timeoutId = setTimeout(() => {
            if (!useAuthStore.persist.hasHydrated()) {
                setHydrationTimedOut(true);
                setIsHydrated(true);
            }
        }, HYDRATION_TIMEOUT_MS);

        const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
            clearTimeout(timeoutId);
            setIsHydrated(true);
        });

        return () => {
            clearTimeout(timeoutId);
            unsubscribe?.();
        };
    }, []);

    useEffect(() => {
        if (!isHydrated) {
            return;
        }

        const hasValidUsername = !!username && USERNAME_REGEX.test(username);
        const hasAccess = isAuthenticated && hasMatchingRole(roles) && hasValidUsername;

        if (!hasAccess || hydrationTimedOut) {
            const errorMessage = hydrationTimedOut
                ? "Session timed out. Please login again."
                : !hasValidUsername && isAuthenticated
                    ? "Session corrupted. Please login again."
                    : undefined;

            // Call appropriate logout based on authentication state
            handleUnauthorizedAccess(errorMessage);
        }
    }, [isHydrated, hydrationTimedOut, isAuthenticated, roles, username, hasMatchingRole, handleUnauthorizedAccess]);

    const hasValidUsername = !!username && USERNAME_REGEX.test(username);
    const hasAccess = isHydrated && isAuthenticated && hasMatchingRole(roles) && hasValidUsername;

    return {
        isAuthenticated: hasAccess,
        isLoading: !isHydrated
    };
};
