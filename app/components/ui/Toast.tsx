import { memo } from "react";
import { CheckCircle, X } from "lucide-react";
import { colors, typography } from "~/resources/colors/colors";
import ReactDOM from "react-dom";

interface ToastProps {
    message: string;
    visible: boolean;
    onClose: () => void;
}

const Toast = memo(({ message, visible, onClose }: ToastProps) => {
    if (!visible) return null;

    const toastContent = (
        <div
            className="fixed top-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-2 fade-in duration-300"
            style={{
                zIndex: 10000,
                backgroundColor: colors.success,
                color: colors.white,
                maxWidth: "400px",
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            }}
        >
            <CheckCircle size={20} />
            <p style={{
                fontSize: typography.bodySmall.fontSize,
                fontWeight: "500",
                lineHeight: typography.bodySmall.lineHeight,
                margin: 0,
            }}>
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

    // Render toast using portal to ensure it's above all other elements
    return ReactDOM.createPortal(toastContent, document.body);
});

Toast.displayName = "Toast";

export default Toast;
