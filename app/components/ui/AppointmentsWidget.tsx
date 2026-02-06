import { memo } from "react";
import { Calendar, AlertCircle, RefreshCw } from "lucide-react";
import { colors, typography } from "~/resources/colors/colors";
import { Spinner } from "~/components/ui/spinner";
import AppointmentCard from "~/components/ui/AppointmentCard";
import type { AppointmentResponse } from "~/domain/appointment/generated/model";
import type { UserAppointmentsState } from "~/domain/appointment/UserAppointments";
import type { UserAppointmentsModelView } from "~/model/appointment/UserAppointmentsModelView";

interface AppointmentsWidgetProps {
    state: UserAppointmentsState;
    model: UserAppointmentsModelView;
    appointments: AppointmentResponse[];
}

const AppointmentsWidget = memo(({ state, model, appointments }: AppointmentsWidgetProps) => (
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
                    />
                ))}
            </div>
        )}
    </div>
));

AppointmentsWidget.displayName = "AppointmentsWidget";

export default AppointmentsWidget;
