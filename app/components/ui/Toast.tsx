import { memo } from "react";
import { CheckCircle, X } from "lucide-react";
import { colors, typography } from "~/resources/colors/colors";

interface ToastProps {
    message: string;
    visible: boolean;
    onClose: () => void;
}

const Toast = memo(({ message, visible, onClose }: ToastProps) => {
    if (!visible) return null;

    return (
        <div
            className="fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-2 fade-in duration-300"
            style={{
                backgroundColor: colors.success,
                color: colors.white,
                maxWidth: "400px",
            }}
        >
            <CheckCircle size={20} />
            <p style={{ ...typography.bodySmall, fontWeight: "500", margin: 0 }}>
                {message}
            </p>
            <button
                onClick={onClose}
                className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Close notification"
            >
                <X size={16} />
            </button>
        </div>
    );
});

Toast.displayName = "Toast";

export default Toast;
