import { X } from "lucide-react";
import { colors, typography } from "~/resources/colors/colors";
import { SERVICE_TYPES } from "~/domain/appointment/BookAppointment";
import type { BookAppointmentModelView } from "~/model/appointment/BookAppointmentModelView";
import type { BookAppointmentState } from "~/domain/appointment/BookAppointment";
import { useBookAppointmentModalModelView } from "~/model/appointment/BookAppointmentModalModelView";
import { bookAppointmentModalResources } from "~/resources/label/appointment-labels";
import { PrimaryButton, SecondaryButton } from "~/components/ui/buttons";

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
    const isRescheduleMode = model.isRescheduleMode;

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
                        {model.modalTitle}
                    </h3>
                    <button
                        onClick={model.closeModal}
                        disabled={isLoading}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                        aria-label={bookAppointmentModalResources.closeButton.ariaLabel}
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
                            {isRescheduleMode ? bookAppointmentModalResources.selectedAppointment.labelReschedule : bookAppointmentModalResources.selectedAppointment.label}
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

                    {/* Service Type Selection - Hide in reschedule mode since it's pre-filled */}
                    {!isRescheduleMode && (
                        <div className="mb-2">
                            <p
                                style={{
                                    ...typography.label,
                                    color: colors.textPrimary,
                                    marginBottom: "12px",
                                }}
                            >
                                {bookAppointmentModalResources.serviceType.label}{" "}
                                <span style={{ color: colors.red }}>{bookAppointmentModalResources.serviceType.required}</span>
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
                    )}

                    {/* Service Type Display - Show in reschedule mode */}
                    {isRescheduleMode && selectedServiceType && (
                        <div className="mb-2">
                            <p
                                style={{
                                    ...typography.label,
                                    color: colors.textPrimary,
                                    marginBottom: "8px",
                                }}
                            >
                                {bookAppointmentModalResources.serviceType.labelReschedule}
                            </p>
                            <p
                                style={{
                                    ...typography.body,
                                    color: colors.textSecondary,
                                    padding: "12px 16px",
                                    backgroundColor: colors.bgLight,
                                    borderRadius: "8px",
                                }}
                            >
                                {selectedServiceType}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    className="px-6 py-4 border-t flex gap-3"
                    style={{
                        borderColor: colors.borderLight,
                        backgroundColor: colors.bgLight,
                    }}
                >
                    <SecondaryButton
                        label={bookAppointmentModalResources.buttons.cancel.label}
                        onClick={model.closeModal}
                        disabled={isLoading}
                        className="flex-1"
                        fullWidth={false}
                    />
                    <PrimaryButton
                        label={model.confirmButtonText}
                        onClick={model.confirmBooking}
                        disabled={!isConfirmEnabled}
                        isLoading={isLoading}
                        className="flex-1"
                        fullWidth={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default BookAppointmentModal;
