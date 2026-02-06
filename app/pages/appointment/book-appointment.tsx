import { useBookAppointmentModelView } from "~/model/appointment/BookAppointmentModelView";
import BookAppointmentModal from "./BookAppointmentModal";
import { colors, typography } from "~/resources/colors/colors";
import { ArrowLeft, MapPin, Calendar, Clock } from "lucide-react";

/**
 * Book Appointment Page
 * Receives slot data from navigation state and shows booking modal
 */
const BookAppointment = () => {
    const { state, model } = useBookAppointmentModelView();


    return (
        <div className="w-full max-w-[900px] min-h-[90vh] md:min-h-[800px] mt-4 rounded-sm shadow-xl flex flex-col overflow-hidden bg-white mx-auto">
            {/* Header */}
            <div
                className="px-6 py-4 border-b z-10 flex-shrink-0"
                style={{ backgroundColor: colors.bgLight, borderColor: colors.borderLight }}
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.history.back()}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="h-6 w-6" style={{ color: colors.textSecondary }} />
                    </button>
                    <div>
                        <p style={{ ...typography.bodyLarge, fontWeight: "700", color: colors.textSecondary }}>
                            Book Appointment
                        </p>
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" style={{ color: colors.red }} />
                            <p style={{ ...typography.caption, fontWeight: "700", color: colors.red }}>
                                {state.userData.branchName}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content - Appointment Summary */}
            <div className="flex-1 p-6">
                <h4 style={{ ...typography.h4, color: colors.primary, marginBottom: "24px" }}>
                    Appointment Details
                </h4>

                {/* Date & Time Summary */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: colors.bgLight }}>
                        <Calendar className="h-5 w-5" style={{ color: colors.primary }} />
                        <div>
                            <p style={{ ...typography.caption, color: colors.textMuted }}>Date</p>
                            <p style={{ ...typography.bodyLarge, fontWeight: "600", color: colors.textPrimary }}>
                                {state.userData.displayDate}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: colors.bgLight }}>
                        <Clock className="h-5 w-5" style={{ color: colors.primary }} />
                        <div>
                            <p style={{ ...typography.caption, color: colors.textMuted }}>Time</p>
                            <p style={{ ...typography.bodyLarge, fontWeight: "600", color: colors.textPrimary }}>
                                {state.userData.slotTime}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Book Appointment Modal */}
            <BookAppointmentModal state={state} model={model} />
        </div>
    );
};

export default BookAppointment;
