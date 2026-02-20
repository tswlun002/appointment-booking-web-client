import useAuthStore from "~/model/auth/zustand/AuthStore";
import { useShallow } from "zustand/react/shallow";
import { useLogoutModelView, LogoutModelView } from "~/model/auth/LogoutModelView";

export const useSecuredHeaderModelView = () => {
    const { user } = useAuthStore(
        useShallow((s) => ({
            user: s.user,
        }))
    );

    // Use LogoutModelView for logout functionality
    const { model: logoutModel } = useLogoutModelView();

    return {
        user,
        model: logoutModel,
    };
};

/** Get display name for user - utility function */
export const getDisplayName = (user: { firstname?: string; username?: string } | undefined): string => {
    return user?.firstname || user?.username || "User";
};
