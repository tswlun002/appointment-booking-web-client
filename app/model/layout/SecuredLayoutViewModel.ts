import {useLocation, useNavigate} from "react-router";
import useAuthStore from "~/model/auth/zustand/AuthStore";
import {useShallow} from "zustand/react/shallow";
import {useEffect, useState} from "react";
import {SECURED_PAGE_ROLES} from "~/domain/role/Roles";

export const useSecuredLayoutModel =()=>{
    const [isReady, setIsReady] = useState(false)

    const location = useLocation();
    const navigate = useNavigate();

    const {isAuthenticated, roles} = useAuthStore( useShallow((state) => ({
        isAuthenticated: state.isAuthenticated,
        roles: state.roles,

    })));



    // Force rehydration
    useEffect(() => {
        // Check if already hydrated
        if (useAuthStore.persist.hasHydrated()) {
            setIsReady(true)
            return
        }

        // Wait for hydration if not hydrated yet
        const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
            setIsReady(true)
        })

        return () => unsubscribe?.()
    }, [])


    const match = (string : string) => {
        return SECURED_PAGE_ROLES.map(s=>s.trim().toLowerCase()).includes(string.toLowerCase())
    }

    const hasAccessToPermission =isReady && isAuthenticated && roles?.some(role =>match(role));

    useEffect(() => {
        if (useAuthStore.persist.hasHydrated()) {
            return
        }

        if (!hasAccessToPermission) {
            navigate("/", { replace: true, state: { from: location } })
        }

    }, [hasAccessToPermission,isReady]);

    return {isAuthenticated:isAuthenticated && isReady, isLoading: !isReady};
}