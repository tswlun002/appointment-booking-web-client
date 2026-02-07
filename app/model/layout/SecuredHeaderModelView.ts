import { useMemo } from "react";
import useAuthStore from "~/model/auth/zustand/AuthStore";
import { useShallow } from "zustand/react/shallow";

export const useSecuredHeaderModelView = () => {
    const { user, logout } = useAuthStore(
        useShallow((s) => ({
            user: s.user,
            logout: s.logout
        }))
    );

    const model = useMemo(
        () => new SecuredHeaderModelView(logout),
        [logout]
    );

    return {
        user,
        model,
    };
};

export class SecuredHeaderModelView {
    constructor(private logoutFn: () => void) {}

    /** Handle logout */
    handleLogout = (): void => {
        this.logoutFn();
    };

    /** Get display name for user */
    getDisplayName = (user: { firstname?: string; username?: string } | undefined): string => {
        return user?.firstname || user?.username || "User";
    };
}
