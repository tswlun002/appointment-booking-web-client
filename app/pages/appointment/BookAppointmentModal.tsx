import { X, Loader2 } from "lucide-react";
import { colors, typography } from "~/resources/colors/colors";
import { SERVICE_TYPES } from "~/domain/appointment/BookAppointment";
import type { BookAppointmentModelView } from "~/model/appointment/BookAppointmentModelView";
import type { BookAppointmentState } from "~/domain/appointment/BookAppointment";
import { useBookAppointmentModalModelView } from "~/model/appointment/BookAppointmentModalModelView";

interface BookAppointmentModalProps {
    state: BookAppointmentState;
    model: BookAppointmentModelView;
}

const BookAppointmentModal = ({ state, model }: BookAppointmentModalProps) => {
    const { isVisible, isAnimating, handleBackdropClick } = useBookAppointmentModalModelView(state, model);

    const selectedDate = state.userData.displayDate;
    const selectedTime = state.userData.slotTime;
    const selectedServiceType = state.userData.serviceType;
    const isLoading = state.isLoading;
    const errorMessage = state.errors.response?.message;
    const isConfirmEnabled = model.isConfirmEnabled();

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 transition-opacity duration-300 ease-out"
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    opacity: isAnimating ? 1 : 0,
                }}
                onClick={handleBackdropClick}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                className="relative w-full sm:max-w-md sm:mx-4 rounded-t-2xl sm:rounded-lg shadow-xl overflow-hidden transition-all duration-300 ease-out"
                style={{
                    backgroundColor: colors.white,
                    transform: isAnimating ? "translateY(0)" : "translateY(100%)",
                    maxHeight: "85vh",
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Drag handle (mobile) */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div
                        className="w-10 h-1 rounded-full"
                        style={{ backgroundColor: colors.borderMedium }}
                    />
                </div>

                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-4 border-b"
                    style={{ borderColor: colors.borderLight }}
                >
                    <h3
                        id="modal-title"
                        style={{ ...typography.h4, color: colors.textPrimary, margin: 0 }}
                    >
                        Book Appointment
                    </h3>
                    <button
                        onClick={model.closeModal}
                        disabled={isLoading}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                        aria-label="Close modal"
                    >
                        <X className="h-5 w-5" style={{ color: colors.textMuted }} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: "calc(85vh - 180px)" }}>
                    {/* Error Message */}
                    {errorMessage && (
                        <div
                            className="p-3 rounded-lg mb-4"
                            style={{ backgroundColor: colors.redLight, borderColor: colors.redBorder }}
                        >
                            <p style={{ ...typography.bodySmall, color: colors.red, margin: 0 }}>
                                {errorMessage}
                            </p>
                        </div>
                    )}

                    {/* Selected Slot Summary */}
                    <div
                        className="p-4 rounded-lg mb-6"
                        style={{ backgroundColor: colors.primaryLight }}
                    >
                        <p
                            style={{
                                ...typography.caption,
                                color: colors.textMuted,
                                marginBottom: "4px",
                            }}
                        >
                            Selected Appointment
                        </p>
                        <p
                            style={{
                                ...typography.bodyLarge,
                                fontWeight: "600",
                                color: colors.primary,
                                margin: 0,
                            }}
                        >
                            {selectedDate} • {selectedTime}
                        </p>
                    </div>

                    {/* Service Type Selection */}
                    <div className="mb-2">
                        <p
                            style={{
                                ...typography.label,
                                color: colors.textPrimary,
                                marginBottom: "12px",
                            }}
                        >
                            What do you need help with?{" "}
                            <span style={{ color: colors.red }}>*</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {SERVICE_TYPES.map((serviceType) => {
                                const isSelected = selectedServiceType === serviceType;
                                return (
                                    <button
                                        key={serviceType}
                                        onClick={(e) => model.selectServiceType(serviceType, e)}
                                        disabled={isLoading}
                                        className="px-4 py-2 rounded-full border-2 transition-all duration-200 hover:shadow-sm active:scale-95 disabled:opacity-50"
                                        style={{
                                            ...typography.bodySmall,
                                            fontWeight: "500",
                                            backgroundColor: isSelected ? colors.primary : colors.white,
                                            borderColor: isSelected ? colors.primary : colors.borderLight,
                                            color: isSelected ? colors.white : colors.textSecondary,
                                        }}
                                    >
                                        {serviceType}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div
                    className="px-6 py-4 border-t flex gap-3"
                    style={{
                        borderColor: colors.borderLight,
                        backgroundColor: colors.bgLight,
                    }}
                >
                    <button
                        onClick={model.closeModal}
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-lg border-2 transition-all duration-200 hover:bg-gray-50 active:scale-98 disabled:opacity-50"
                        style={{
                            ...typography.button,
                            borderColor: colors.borderLight,
                            color: colors.textSecondary,
                            backgroundColor: colors.white,
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={model.confirmBooking}
                        disabled={!isConfirmEnabled}
                        className={`flex-1 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                            isConfirmEnabled
                                ? "hover:opacity-90 active:scale-98"
                                : "cursor-not-allowed"
                        }`}
                        style={{
                            ...typography.button,
                            backgroundColor: isConfirmEnabled ? colors.primary : colors.borderMedium,
                            color: colors.white,
                            opacity: isConfirmEnabled ? 1 : 0.5,
                        }}
                    >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isLoading ? "Booking..." : "Book Appointment"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookAppointmentModal;
