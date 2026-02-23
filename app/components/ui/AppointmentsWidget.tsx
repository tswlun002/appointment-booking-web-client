import { memo } from "react";
import { Calendar, AlertCircle, RefreshCw, ChevronDown } from "lucide-react";
import { colors, typography } from "~/resources/colors/colors";
import { Spinner } from "~/components/ui/spinner";
import AppointmentCard from "~/components/ui/AppointmentCard";
import CancelAppointmentModal from "~/components/ui/CancelAppointmentModal";
import Toast from "~/components/ui/Toast";
import type { CancelAppointmentModelView } from "~/model/appointment/CancelAppointmentModelView";
import type { CancelAppointmentState } from "~/domain/appointment/CancelAppointment";
import type { AppointmentResponse } from "~/domain/appointment/generated/model";
import type { UserAppointmentsState } from "~/domain/appointment/UserAppointments";
import type { UserAppointmentsModelView } from "~/model/appointment/UserAppointmentsModelView";
import {userAppointmentsScreenResources} from "~/resources/label/appointment-labels";

interface AppointmentsWidgetProps {
    state: UserAppointmentsState;
    model: UserAppointmentsModelView;
    appointments: AppointmentResponse[];
    cancelState: CancelAppointmentState;
    cancelModel: CancelAppointmentModelView;
}

const AppointmentsWidget = memo(({ state, model, appointments, cancelState, cancelModel }: AppointmentsWidgetProps) => {

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
                            {state.errors.response?.message || userAppointmentsScreenResources.errorState.title}
                        </p>
                        <button
                            onClick={() => model.refetch()}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: colors.primary, color: colors.white, ...typography.button }}
                            aria-label={userAppointmentsScreenResources.errorState.retryButton}
                        >
                            <RefreshCw size={16} /> {userAppointmentsScreenResources.errorState.retryButton}
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!state.isLoading && !state.errors.response?.isError && appointments.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
                        <Calendar size={48} style={{ color: colors.textMuted }} />
                        <p style={{ ...typography.body, color: colors.textSecondary, textAlign: "center" }}>
                            {userAppointmentsScreenResources.emptyState.title}
                        </p>
                        <p style={{ ...typography.caption, color: colors.textMuted, textAlign: "center" }}>
                            {userAppointmentsScreenResources.emptyState.message}
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
                                onRescheduleClick={(apt) => model.handleRescheduleClick(apt)}
                            />
                        ))}

                        {/* Load More Button */}
                        {model.hasMore && (
                            <button
                                onClick={() => model.loadMoreAppointments()}
                                disabled={state.isLoading}
                                className="w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: colors.bgWhite,
                                    color: colors.textSecondary,
                                    border: `1px solid ${colors.borderLight}`,
                                    ...typography.button
                                }}
                                aria-label={userAppointmentsScreenResources.loadMoreButton.label}
                            >
                                {state.isLoading ? (
                                    <>
                                        <Spinner color={colors.textSecondary} className="h-4 w-4" />
                                        <span>{userAppointmentsScreenResources.loadMoreButton.loadingLabel}</span>
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown size={16} />
                                        <span>{userAppointmentsScreenResources.loadMoreButton.label}</span>
                                    </>
                                )}
                            </button>
                        )}
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
