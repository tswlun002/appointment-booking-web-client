import { memo } from "react";
import { AlertTriangle, X } from "lucide-react";
import { colors, typography } from "~/resources/colors/colors";
import type { CancelAppointmentState } from "~/domain/appointment/CancelAppointment";
import type { CancelAppointmentModelView } from "~/model/appointment/CancelAppointmentModelView";
import ReactDOM from "react-dom";

interface CancelAppointmentModalProps {
    state: CancelAppointmentState;
    model: CancelAppointmentModelView;
}

const CancelAppointmentModal = memo(({ state, model }: CancelAppointmentModalProps) => {
    const isOpen = model.isModalOpen;
    const isLoading = state.isLoading;
    const appointment = model.appointment;
    const errorMessage = state.errors.response?.isError ? state.errors.response?.message : "";
    const reason = model.reason;

    if (!isOpen || !appointment) return null;

    const modalContent = (
        <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
                onClick={() => !isLoading && model.closeModal()}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-md rounded-xl shadow-2xl p-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                style={{
                    backgroundColor: colors.white,
                    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                }}
            >
                {/* Close button */}
                <button
                    onClick={model.closeModal}
                    disabled={isLoading}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                    aria-label="Close"
                >
                    <X size={20} style={{ color: colors.textMuted }} />
                </button>

                {/* Warning icon */}
                <div className="flex justify-center mb-4">
                    <div
                        className="p-3 rounded-full"
                        style={{ backgroundColor: colors.redLight }}
                    >
                        <AlertTriangle size={32} style={{ color: colors.red }} />
                    </div>
                </div>

                {/* Title */}
                <h3
                    className="text-center mb-2"
                    style={{
                        fontSize: typography.h4.fontSize,
                        fontWeight: typography.h4.fontWeight,
                        lineHeight: typography.h4.lineHeight,
                        color: colors.textPrimary,
                    }}
                >
                    Cancel Appointment?
                </h3>

                {/* Appointment info */}
                <p
                    className="text-center mb-4"
                    style={{
                        fontSize: typography.body.fontSize,
                        fontWeight: typography.body.fontWeight,
                        lineHeight: typography.body.lineHeight,
                        color: colors.textSecondary,
                    }}
                >
                    Are you sure you want to cancel your appointment for{" "}
                    <strong style={{ color: colors.textPrimary }}>{appointment.serviceType}</strong> on{" "}
                    <strong style={{ color: colors.textPrimary }}>{model.formatFullDate(appointment.dateTime)}</strong>?
                </p>

                {/* Branch info */}
                {appointment.branchName && (
                    <p
                        className="text-center mb-4"
                        style={{
                            fontSize: typography.bodySmall.fontSize,
                            fontWeight: typography.bodySmall.fontWeight,
                            lineHeight: typography.bodySmall.lineHeight,
                            color: colors.textMuted,
                        }}
                    >
                        at {appointment.branchName}
                    </p>
                )}

                {/* Error message */}
                {errorMessage && (
                    <div
                        className="p-3 rounded-lg mb-4 animate-in shake duration-300"
                        style={{ backgroundColor: colors.redLight }}
                    >
                        <p style={{
                            fontSize: typography.bodySmall.fontSize,
                            fontWeight: typography.bodySmall.fontWeight,
                            lineHeight: typography.bodySmall.lineHeight,
                            color: colors.red,
                            margin: 0,
                        }}>
                            {errorMessage}
                        </p>
                    </div>
                )}

                {/* Required reason */}
                <div className="mb-6">
                    <label
                        style={{
                            fontSize: typography.label.fontSize,
                            fontWeight: typography.label.fontWeight,
                            lineHeight: typography.label.lineHeight,
                            color: colors.textSecondary,
                        }}
                        className="block mb-2"
                    >
                        Reason for cancellation <span style={{ color: colors.red }}>*</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => model.setReason(e.target.value)}
                        placeholder="Please tell us why you're cancelling..."
                        disabled={isLoading}
                        className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 transition-all"
                        style={{
                            borderColor: colors.borderLight,
                            fontSize: typography.body.fontSize,
                            fontWeight: typography.body.fontWeight,
                            lineHeight: typography.body.lineHeight,
                            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                        }}
                        rows={3}
                        maxLength={500}
                    />
                    <p
                        className="text-right mt-1"
                        style={{
                            fontSize: typography.caption.fontSize,
                            fontWeight: typography.caption.fontWeight,
                            lineHeight: typography.caption.lineHeight,
                            color: colors.textMuted,
                        }}
                    >
                        {reason.length}/500
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={model.closeModal}
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-lg border-2 transition-all hover:bg-gray-50 disabled:opacity-50"
                        style={{
                            borderColor: colors.borderMedium,
                            color: colors.textSecondary,
                            fontSize: typography.button.fontSize,
                            fontWeight: typography.button.fontWeight,
                            lineHeight: typography.button.lineHeight,
                            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                        }}
                    >
                        Keep Appointment
                    </button>
                    <button
                        onClick={model.confirmCancel}
                        disabled={isLoading || !reason.trim()}
                        className="flex-1 py-3 rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: colors.red,
                            color: colors.white,
                            fontSize: typography.button.fontSize,
                            fontWeight: typography.button.fontWeight,
                            lineHeight: typography.button.lineHeight,
                            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                        }}
                    >
                        {isLoading ? "Cancelling..." : "Yes, Cancel"}
                    </button>
                </div>
            </div>
        </div>
    );

    // Render modal using portal to ensure it's above all other elements
    return ReactDOM.createPortal(modalContent, document.body);
});

CancelAppointmentModal.displayName = "CancelAppointmentModal";

export default CancelAppointmentModal;
