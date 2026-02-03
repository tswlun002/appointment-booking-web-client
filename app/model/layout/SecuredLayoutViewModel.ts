import {useLocation, useNavigate} from "react-router";
import useAuthStore from "~/model/auth/zustand/AuthStore";
import {useShallow} from "zustand/react/shallow";
import {useCallback, useEffect, useMemo, useState} from "react";
import {SECURED_PAGE_ROLES} from "~/domain/role/Roles";

const HYDRATION_TIMEOUT_MS = 10000;

export const useSecuredLayoutModel = () => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [hydrationTimedOut, setHydrationTimedOut] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const {isAuthenticated, roles} = useAuthStore(useShallow((state) => ({
        isAuthenticated: state.isAuthenticated,
        roles: state.roles,
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

        const hasAccess = isAuthenticated && hasMatchingRole(roles);

        if (!hasAccess || hydrationTimedOut) {
            navigate("/", { replace: true, state: { from: location } });
        }
    }, [isHydrated]);

    const hasAccess = isHydrated && isAuthenticated && hasMatchingRole(roles);

    return {
        isAuthenticated: hasAccess,
        isLoading: !isHydrated
    };
};
