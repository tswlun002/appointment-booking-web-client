import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import { colors, typography } from "~/resources/colors/colors";
import { CheckCircle } from "lucide-react";
import type { AppointmentResponse } from "~/domain/appointment/generated/model";

interface SuccessState {
    appointment?: AppointmentResponse;
}

/**
 * Appointment Success Page
 * Shows booking confirmation after successful appointment creation
 */
const AppointmentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as SuccessState | null;
    const appointment = state?.appointment;

    // Redirect if accessed directly without state
    useEffect(() => {
        if (!appointment) {
            navigate("/appointments", { replace: true });
        }
    }, [appointment, navigate]);

    const handleBackToAppointments = () => {
        navigate("/appointments", { replace: true });
    };

    if (!appointment) {
        return null;
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <div
                className="w-full max-w-md rounded-lg overflow-hidden shadow-xl"
                style={{ backgroundColor: colors.white }}
            >
                {/* Success Header */}
                <div
                    className="p-8 text-center"
                    style={{ backgroundColor: colors.success }}
                >
                    <CheckCircle
                        className="h-16 w-16 mx-auto mb-4"
                        style={{ color: colors.white }}
                    />
                    <h1 style={{ ...typography.h3, color: colors.white, margin: 0 }}>
                        Appointment Booked!
                    </h1>
                    <p
                        style={{
                            ...typography.body,
                            color: colors.white,
                            opacity: 0.9,
                            marginTop: "8px",
                        }}
                    >
                        Your appointment has been successfully scheduled.
                    </p>
                </div>

                {/* Appointment Details */}
                <div className="p-6">
                    {appointment.reference && (
                        <div
                            className="text-center pb-4 mb-4 border-b"
                            style={{ borderColor: colors.borderLight }}
                        >
                            <p style={{ ...typography.caption, color: colors.textMuted }}>
                                Reference Number
                            </p>
                            <p style={{ ...typography.h4, color: colors.primary, margin: 0 }}>
                                {appointment.reference}
                            </p>
                        </div>
                    )}

                    <div
                        className="rounded-lg p-4 space-y-3"
                        style={{ backgroundColor: colors.bgLight }}
                    >
                        {appointment.serviceType && (
                            <div>
                                <p style={{ ...typography.caption, color: colors.textMuted }}>
                                    Service
                                </p>
                                <p
                                    style={{
                                        ...typography.body,
                                        fontWeight: "600",
                                        color: colors.textPrimary,
                                        margin: 0,
                                    }}
                                >
                                    {appointment.serviceType}
                                </p>
                            </div>
                        )}

                        {appointment.dateTime && (
                            <div>
                                <p style={{ ...typography.caption, color: colors.textMuted }}>
                                    Date & Time
                                </p>
                                <p
                                    style={{
                                        ...typography.body,
                                        fontWeight: "600",
                                        color: colors.textPrimary,
                                        margin: 0,
                                    }}
                                >
                                    {new Date(appointment.dateTime).toLocaleDateString("en-ZA", {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </p>
                                <p
                                    style={{
                                        ...typography.bodySmall,
                                        color: colors.textSecondary,
                                        margin: 0,
                                    }}
                                >
                                    {new Date(appointment.dateTime).toLocaleTimeString("en-ZA", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        )}

                        {appointment.status && (
                            <div>
                                <p style={{ ...typography.caption, color: colors.textMuted }}>
                                    Status
                                </p>
                                <p
                                    style={{
                                        ...typography.body,
                                        fontWeight: "600",
                                        color: colors.success,
                                        margin: 0,
                                    }}
                                >
                                    {appointment.status}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Back Button */}
                <div className="p-6 pt-0">
                    <button
                        onClick={handleBackToAppointments}
                        className="w-full py-3 rounded-lg transition-all duration-200 hover:opacity-90 active:scale-98"
                        style={{
                            ...typography.button,
                            backgroundColor: colors.primary,
                            color: colors.white,
                        }}
                    >
                        Back to Appointments
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppointmentSuccess;
