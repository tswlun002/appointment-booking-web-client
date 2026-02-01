import {useLocation, useNavigate} from "react-router";
import useAuthStore from "~/model/auth/zustand/AuthStore";
import {useShallow} from "zustand/react/shallow";
import {useEffect} from "react";
import {SECURED_PAGE_ROLES} from "~/domain/role/Roles";

export const useSecuredLayoutModel =()=>{

    const location = useLocation();
    const navigate = useNavigate();

    const {isAuthenticated, roles} = useAuthStore( useShallow((state) => ({
        isAuthenticated: state.isAuthenticated,
        roles: state.roles,
    })));

    const match = (string : string) => {
        return SECURED_PAGE_ROLES.map(s=>s.trim().toLowerCase()).includes(string.toLowerCase())
    }

    const hasAccessToPermission = isAuthenticated && roles?.some(role =>match(role));

    useEffect(() => {

        if (!hasAccessToPermission) {

            navigate("/", { replace: true, state: { from: location } });
        }

    }, [hasAccessToPermission]);
     console.log(roles,isAuthenticated);
    console.log(hasAccessToPermission);

    return isAuthenticated;
}