import { colors, typography } from "~/resources/colors/colors";
import { useSlotModelView } from "~/model/slot/SlotModelView";
import { LocalDate } from "~/utils/CompanionObjects";
import SlotHeader from "~/components/ui/SlotHeader";
import DateButton from "~/components/ui/DateButton";
import LegendItem from "~/components/ui/LegendItem";
import SlotButton from "~/components/ui/SlotButton";
import EmptySlots from "~/components/ui/EmptySlots";
import type { MouseEvent } from "react";
import { AlertTriangle, CalendarClock } from "lucide-react";

const AppointmentSlots = () => {
    const { state, model, responseData, days, yearMonth } = useSlotModelView();
    const currentDaySlots = responseData.get(state.userData.fromDate!) ?? [];

    // Handle slot selection - navigate to booking page with slot data
    const handleSlotSelect = (slotId: string, event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        // Find the slot to get its details
        const slot = currentDaySlots.find((s) => s.id === slotId);
        if (slot) {
            const slotTime = `${model.sliceTime(slot.startTime)} - ${model.sliceTime(slot.endTime)}`;
            const formattedDate = `${LocalDate.dayName(new Date(state.userData.fromDate!))} ${LocalDate.dayOfTheMonth(new Date(state.userData.fromDate!))} ${yearMonth.month}`;

            // Navigate to booking page with all slot data
            model.navigateToBooking(slot, formattedDate, slotTime);
        }
    };

    return (
        <div className="w-full max-w-[900px] h-[90vh] md:h-[800px] mt-4 rounded-sm shadow-xl flex flex-col overflow-hidden bg-white mx-auto">
            {/* Header */}
            <SlotHeader
                branchName={state.branchName}
                distance={state.distance}
                onBack={model.backToBranch}
            />

            {/* Reschedule Mode Header */}
            {model.isRescheduleMode && (
                <div
                    className="px-6 py-4 border-b"
                    style={{ backgroundColor: colors.primaryLight, borderColor: colors.borderLight }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <CalendarClock size={20} style={{ color: colors.primary }} />
                        <h3 style={{ ...typography.h4, color: colors.primary, margin: 0 }}>
                            Reschedule Appointment
                        </h3>
                    </div>
                    <p style={{ ...typography.bodySmall, color: colors.textSecondary, margin: 0 }}>
                        Currently scheduled: <strong>{model.formatCurrentAppointmentDate()}</strong>
                    </p>
                    <p style={{ ...typography.bodySmall, color: colors.textMuted, margin: 0 }}>
                        Service: <strong>{model.rescheduleData?.serviceType}</strong>
                    </p>
                </div>
            )}

            {/* Last Reschedule Warning */}
            {model.isRescheduleMode && model.isLastReschedule && (
                <div
                    className="px-6 py-3 flex items-center gap-3"
                    style={{ backgroundColor: colors.warningLight, borderBottomWidth: 1, borderColor: colors.warningBorder }}
                >
                    <AlertTriangle size={20} style={{ color: colors.warning }} />
                    <p style={{ ...typography.bodySmall, color: colors.warning, margin: 0, fontWeight: "600" }}>
                        Last Reschedule — This is your final reschedule. Maximum 3 reschedules allowed per appointment.
                    </p>
                </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {/* Date Section Header */}
                <div className="mb-6">
                    <h4 style={{ ...typography.h4, color: colors.primary }}>Select {model.isRescheduleMode ? "New " : ""}Date</h4>
                    <p style={{ ...typography.caption, fontWeight: "700", color: colors.textMuted }}>
                        {yearMonth.month} {yearMonth.year}
                    </p>
                </div>

                {/* Date Selection */}
                <div
                    className="flex flex-row gap-6 overflow-x-auto pb-6 border-b mb-6 p-2"
                    style={{ borderColor: colors.borderLight }}
                >
                    {days?.map((date) => (
                        <DateButton
                            key={date}
                            date={date}
                            isSelected={state.userData.fromDate === date}
                            isFullyBooked={state.userData.status === "FULLY_BOOKED"}
                            isBlocked={state.userData.status === "BLOCKED"}
                            onSelect={model.selectedDay}
                        />
                    ))}
                </div>

                {/* Available Times Header & Legend */}
                <div className="flex flex-row justify-between items-center mb-4">
                    <h4 style={{ ...typography.bodyLarge, fontWeight: "700", color: colors.textSecondary }}>
                        Available Times
                    </h4>
                    <div className="flex flex-wrap gap-4">
                        <LegendItem color={colors.success} label="Available" />
                        <LegendItem color={colors.red} label="Full" />
                        <LegendItem color={colors.primaryDark} label="Blocked" />
                        <LegendItem color={colors.textMuted} label="Past" />
                    </div>
                </div>

                {/* Slots Grid */}
                {currentDaySlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {currentDaySlots.map((slot) => (
                            <SlotButton
                                key={slot.id}
                                slot={slot}
                                isSelected={state.userData.selectedSlotId === slot.id}
                                isPast={model.isSlotPast(slot)}
                                onSelect={handleSlotSelect}
                                formatTime={model.sliceTime}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptySlots />
                )}
            </div>
        </div>
    );
};

export default AppointmentSlots;

