import { memo, useCallback } from "react";
import { Calendar, AlertCircle, RefreshCw } from "lucide-react";
import { colors, typography } from "~/resources/colors/colors";
import { Spinner } from "~/components/ui/spinner";
import AppointmentCard from "~/components/ui/AppointmentCard";
import CancelAppointmentModal from "~/components/ui/CancelAppointmentModal";
import Toast from "~/components/ui/Toast";
import { useCancelAppointmentModelView } from "~/model/appointment/CancelAppointmentModelView";
import type { AppointmentResponse } from "~/domain/appointment/generated/model";
import type { UserAppointmentsState } from "~/domain/appointment/UserAppointments";
import type { UserAppointmentsModelView } from "~/model/appointment/UserAppointmentsModelView";
import { useNavigate } from "react-router";

interface AppointmentsWidgetProps {
    state: UserAppointmentsState;
    model: UserAppointmentsModelView;
    appointments: AppointmentResponse[];
}

const AppointmentsWidget = memo(({ state, model, appointments }: AppointmentsWidgetProps) => {
    const navigate = useNavigate();

    // Callback when cancel succeeds - update appointment in list
    const handleCancelSuccess = useCallback((updatedAppointment: AppointmentResponse) => {
        model.updateAppointment(updatedAppointment);
    }, [model]);

    // Cancel appointment ModelView
    const { state: cancelState, model: cancelModel } = useCancelAppointmentModelView(handleCancelSuccess);

    // Handle reschedule - navigate to slots page with reschedule mode
    const handleRescheduleClick = useCallback((appointment: AppointmentResponse) => {
        navigate(`/appointments/${appointment.branchId}/slots`, {
            state: {
                mode: 'reschedule',
                appointmentId: appointment.id,
                serviceType: appointment.serviceType,
                branchName: appointment.branchName || `Branch ${appointment.branchId}`,
                currentDateTime: appointment.dateTime,
                rescheduleCount: appointment.rescheduleCount ?? 0,
                distance: "",
            },
        });
    }, [navigate]);

    return (
        <>
            <div
                className="backdrop-blur-xl p-6 rounded-xl shadow-2xl flex flex-col h-full max-h-[850px]"
                style={{
                    backgroundColor: `${colors.bgWhite}33`,
                    borderColor: `${colors.bgWhite}33`,
                    borderWidth: 1
                }}
            >
                <h2
                    style={{ ...typography.h4, color: colors.textPrimary }}
                    className="mb-6 border-b pb-4"
                >
                    Your Appointments
                </h2>

                {/* Loading State */}
                {state.isLoading && (
                    <div className="flex-1 flex items-center justify-center">
                        <Spinner />
                    </div>
                )}

                {/* Error State */}
                {state.errors.response?.isError && !state.isLoading && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
                        <AlertCircle size={48} style={{ color: colors.red }} />
                        <p style={{ ...typography.body, color: colors.textSecondary, textAlign: "center" }}>
                            {state.errors.response?.message || "Failed to load appointments"}
                        </p>
                        <button
                            onClick={() => model.refetch()}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: colors.primary, color: colors.white, ...typography.button }}
                            aria-label="Retry loading appointments"
                        >
                            <RefreshCw size={16} /> Try Again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!state.isLoading && !state.errors.response?.isError && appointments.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
                        <Calendar size={48} style={{ color: colors.textMuted }} />
                        <p style={{ ...typography.body, color: colors.textSecondary, textAlign: "center" }}>
                            No appointments yet
                        </p>
                        <p style={{ ...typography.caption, color: colors.textMuted, textAlign: "center" }}>
                            Find a branch and book your first appointment
                        </p>
                    </div>
                )}

                {/* Appointments List */}
                {!state.isLoading && !state.errors.response?.isError && appointments.length > 0 && (
                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        {appointments.map((appointment: AppointmentResponse) => (
                            <AppointmentCard
                                key={appointment.id}
                                appointment={appointment}
                                model={model}
                                onCancelClick={(apt) => cancelModel.openModal(apt)}
                                onRescheduleClick={handleRescheduleClick}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Cancel Appointment Modal */}
            <CancelAppointmentModal state={cancelState} model={cancelModel} />

            {/* Toast Notification */}
            <Toast
                message={cancelState.toastMessage}
                visible={cancelState.toastVisible}
                onClose={cancelModel.hideToast}
            />
        </>
    );
});

AppointmentsWidget.displayName = "AppointmentsWidget";

export default AppointmentsWidget;
