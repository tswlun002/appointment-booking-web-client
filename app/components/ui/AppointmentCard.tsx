import { memo } from "react";
import { CalendarClock, XCircle, RotateCcw, Info, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { colors, typography } from "~/resources/colors/colors";
import type { AppointmentResponse } from "~/domain/appointment/generated/model";
import type { UserAppointmentsModelView } from "~/model/appointment/UserAppointmentsModelView";

interface AppointmentCardProps {
    appointment: AppointmentResponse;
    model: UserAppointmentsModelView;
    onCancelClick: (appointment: AppointmentResponse) => void;
}

const AppointmentCard = memo(({ appointment, model, onCancelClick }: AppointmentCardProps) => {
    const isExpanded = model.isExpanded(appointment.id);

    return (
        <div
            className="p-4 rounded-xl shadow-sm transition-all"
            style={{
                backgroundColor: colors.bgWhite,
                borderColor: colors.borderLight,
                borderWidth: 1
            }}
        >
            <div className="flex justify-between items-start mb-1">
                <p style={{ ...typography.bodyLarge, fontWeight: "700", color: colors.textPrimary }}>
                    {appointment.serviceType}
                </p>
                <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-tighter ${model.isBeingProcessed(appointment.status) ? 'animate-pulse' : ''}`}
                    style={model.getStatusStyle(appointment.status)}
                >
                    {model.getStatusText(appointment.status)}
                </span>
            </div>

            {/* Date and Time */}
            <p style={{ ...typography.bodySmall, color: colors.textMuted }} className="mb-1">
                {model.formatFullDate(appointment.dateTime)} • {model.formatTime(appointment.dateTime)}
            </p>

            {/* Reference */}
            <p style={{ ...typography.caption, color: colors.primary, fontWeight: "600" }} className="mb-3">
                Ref: {appointment.reference}
            </p>

            {/* View More/Hide Toggle */}
            <button
                onClick={() => model.toggleAppointmentInfo(appointment.id)}
                className="flex items-center gap-1 text-xs font-bold mb-3 hover:underline"
                style={{ color: colors.primary }}
                aria-label={isExpanded ? "Hide appointment details" : "View appointment details"}
            >
                <Info size={14} />
                {isExpanded ? "Hide info" : "View more info"}
                {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
            </button>

            {/* Expanded Info */}
            {isExpanded && (
                <div
                    className="mb-4 p-3 rounded-lg animate-in fade-in slide-in-from-top-1 duration-200 space-y-2"
                    style={{
                        backgroundColor: colors.bgLight,
                        borderColor: colors.borderLight,
                        borderWidth: 1
                    }}
                >
                    <div className="flex gap-2">
                        <MapPin size={16} className="shrink-0 mt-1" style={{ color: colors.red }} />
                        <div>
                            <p style={{ ...typography.bodySmall, fontWeight: "600", color: colors.textSecondary }}>
                                {appointment.branchName || `Branch ${appointment.branchId}`}
                            </p>
                            {appointment.branchAddress && (
                                <p style={{ ...typography.caption, color: colors.textMuted }}>
                                    {appointment.branchAddress}
                                </p>
                            )}
                        </div>
                    </div>
                    {appointment.assignedConsultantId && (
                        <p style={{ ...typography.caption, color: colors.textMuted }}>
                            Consultant: {appointment.assignedConsultantId}
                        </p>
                    )}
                    {appointment.serviceNotes && (
                        <p style={{ ...typography.caption, color: colors.textMuted }}>
                            Notes: {appointment.serviceNotes}
                        </p>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div
                className="flex flex-wrap gap-2 pt-3 border-t"
                style={{ borderColor: colors.bgLight }}
            >
                {model.isBeingProcessed(appointment.status) ? (
                    <div
                        className="w-full text-center py-2 text-xs font-medium rounded-lg"
                        style={{
                            color: colors.warning,
                            backgroundColor: colors.warningLight
                        }}
                    >
                        Your appointment is being processed...
                    </div>
                ) : model.canModify(appointment.status) ? (
                    <>
                        <button
                            onClick={() => onCancelClick(appointment)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border rounded-lg text-xs font-bold hover:opacity-80 transition-opacity"
                            style={{
                                borderColor: colors.redBorder,
                                color: colors.red
                            }}
                            aria-label={`Cancel appointment for ${appointment.serviceType}`}
                        >
                            <XCircle size={14} /> Cancel
                        </button>
                        <button
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border rounded-lg text-xs font-bold hover:opacity-80 transition-opacity"
                            style={{
                                borderColor: colors.primary,
                                color: colors.primary
                            }}
                            aria-label={`Reschedule appointment for ${appointment.serviceType}`}
                        >
                            <CalendarClock size={14} /> Reschedule
                        </button>
                    </>
                ) : model.canRebook(appointment.status) ? (
                    <button
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
                        style={{
                            backgroundColor: colors.primary,
                            color: colors.white
                        }}
                        aria-label={`Rebook appointment for ${appointment.serviceType}`}
                    >
                        <RotateCcw size={16} /> Rebook Appointment
                    </button>
                ) : (
                    <div
                        className="w-full text-center py-2 text-xs font-medium rounded-lg"
                        style={{ color: colors.textMuted, backgroundColor: colors.bgLight }}
                    >
                        {model.getStatusText(appointment.status)}
                    </div>
                )}
            </div>
        </div>
    );
});

AppointmentCard.displayName = "AppointmentCard";

export default AppointmentCard;
