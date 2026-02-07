import { memo } from "react";
import { LogOut, User } from "lucide-react";
import { colors, typography } from "~/resources/colors/colors";
import { useSecuredHeaderModelView } from "~/model/layout/SecuredHeaderModelView";

const SecuredHeader = memo(() => {
    const { user, model } = useSecuredHeaderModelView();

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 shadow-sm"
            style={{
                backgroundColor: colors.primary,
            }}
        >
            {/* Logo / Brand */}
            <div className="flex items-center gap-2">
                <img
                    src="/capitec.svg"
                    alt="Capitec"
                    className="h-8 w-auto"
                />
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center gap-4">
                {/* User Display */}
                <div className="hidden sm:flex items-center gap-2">
                    <User size={18} style={{ color: colors.white }} />
                    <span
                        style={{
                            ...typography.bodySmall,
                            color: colors.white,
                            fontWeight: "500",
                        }}
                    >
                        {model.getDisplayName(user)}
                    </span>
                </div>

                {/* Logout Button */}
                <button
                    onClick={model.handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-white/10 active:scale-95"
                    style={{ color: colors.white }}
                    aria-label="Logout"
                >
                    <LogOut size={18} />
                    <span
                        className="hidden sm:inline"
                        style={{ ...typography.bodySmall, fontWeight: "600" }}
                    >
                        Logout
                    </span>
                </button>
            </div>
        </header>
    );
});

SecuredHeader.displayName = "SecuredHeader";

export default SecuredHeader;
