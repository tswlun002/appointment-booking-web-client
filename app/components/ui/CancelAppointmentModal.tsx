import { memo } from "react";
import { AlertTriangle, X } from "lucide-react";
import { colors, typography } from "~/resources/colors/colors";
import type { CancelAppointmentState } from "~/domain/appointment/CancelAppointment";
import type { CancelAppointmentModelView } from "~/model/appointment/CancelAppointmentModelView";

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
                onClick={() => !isLoading && model.closeModal()}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-md rounded-xl shadow-2xl p-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                style={{ backgroundColor: colors.white }}
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
                    style={{ ...typography.h4, color: colors.textPrimary }}
                >
                    Cancel Appointment?
                </h3>

                {/* Appointment info */}
                <p
                    className="text-center mb-4"
                    style={{ ...typography.body, color: colors.textSecondary }}
                >
                    Are you sure you want to cancel your appointment for{" "}
                    <strong style={{ color: colors.textPrimary }}>{appointment.serviceType}</strong> on{" "}
                    <strong style={{ color: colors.textPrimary }}>{model.formatFullDate(appointment.dateTime)}</strong>?
                </p>

                {/* Branch info */}
                {appointment.branchName && (
                    <p
                        className="text-center mb-4"
                        style={{ ...typography.bodySmall, color: colors.textMuted }}
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
                        <p style={{ ...typography.bodySmall, color: colors.red, margin: 0 }}>
                            {errorMessage}
                        </p>
                    </div>
                )}

                {/* Required reason */}
                <div className="mb-6">
                    <label
                        style={{ ...typography.label, color: colors.textSecondary }}
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
                            ...typography.body,
                        }}
                        rows={3}
                        maxLength={500}
                    />
                    <p
                        className="text-right mt-1"
                        style={{ ...typography.caption, color: colors.textMuted }}
                    >
                        {reason.length}/500
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={model.closeModal}
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-lg border-2 font-semibold transition-all hover:bg-gray-50 disabled:opacity-50"
                        style={{
                            borderColor: colors.borderMedium,
                            color: colors.textSecondary,
                            ...typography.button,
                        }}
                    >
                        Keep Appointment
                    </button>
                    <button
                        onClick={model.confirmCancel}
                        disabled={isLoading || !reason.trim()}
                        className="flex-1 py-3 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: colors.red,
                            color: colors.white,
                            ...typography.button,
                        }}
                    >
                        {isLoading ? "Cancelling..." : "Yes, Cancel"}
                    </button>
                </div>
            </div>
        </div>
    );
});

CancelAppointmentModal.displayName = "CancelAppointmentModal";

export default CancelAppointmentModal;
