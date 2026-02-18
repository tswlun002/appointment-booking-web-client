import {useLocation, useNavigate} from "react-router";
import useAuthStore from "~/model/auth/zustand/AuthStore";
import {useShallow} from "zustand/react/shallow";
import {useCallback, useEffect, useMemo, useState} from "react";
import {SECURED_PAGE_ROLES} from "~/domain/role/Roles";
import {USERNAME_REGEX} from "~/domain/user/User";

const HYDRATION_TIMEOUT_MS = 10000;

export const useSecuredLayoutModel = () => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [hydrationTimedOut, setHydrationTimedOut] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const {isAuthenticated, roles, username} = useAuthStore(useShallow((state) => ({
        isAuthenticated: state.isAuthenticated,
        roles: state.roles,
        username: state.user?.username,
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
            navigate("/", { replace: true, state: { from: location, error: errorMessage } });
        }
    }, [isHydrated]);

    const hasValidUsername = !!username && USERNAME_REGEX.test(username);
    const hasAccess = isHydrated && isAuthenticated && hasMatchingRole(roles) && hasValidUsername;

    return {
        isAuthenticated: hasAccess,
        isLoading: !isHydrated
    };
};
