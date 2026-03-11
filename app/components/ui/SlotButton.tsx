import { colors, typography } from "~/resources/colors/colors";
import type { SlotResponse } from "~/domain/slot/generated/model";
import type { MouseEvent } from "react";

interface SlotButtonProps {
    slot: SlotResponse;
    isSelected: boolean;
    isPast: boolean;
    isFullyBooked: boolean;
    isBlocked: boolean;
    haveSlotBookedInFuture: boolean;
    onSelect: (day:string,slotId: string, e: MouseEvent<HTMLButtonElement>) => void;
    formatTime: (time: string) => string;
}

/** Slot time button */
const SlotButton = ({ slot, isSelected, isPast, onSelect,isFullyBooked,isBlocked, formatTime ,haveSlotBookedInFuture}: SlotButtonProps) => {
    const isDisabled = isPast || isFullyBooked || isBlocked || haveSlotBookedInFuture;

    const getBackgroundColor = () => {
        if (isFullyBooked) return colors.red;
        else if (isBlocked) return colors.primaryDark;
        else if (isPast || haveSlotBookedInFuture) return colors.bgLight;
        else if (isSelected) return colors.primary;
        return "transparent";
    };

    const getBorderColor = () => {
        if (isFullyBooked) return colors.red;
        else if (isBlocked) return colors.primaryDark;
        else if (isPast||haveSlotBookedInFuture) return colors.borderLight;
        else if (isSelected) return colors.primary;

        return colors.borderLight;
    };

    const getTextColor = () => {
        if (isFullyBooked) return colors.white;
        else if (isBlocked) return colors.white;
        else if (isPast||haveSlotBookedInFuture) return colors.textMuted;
        else  if (isSelected) return colors.white;

        return colors.textSecondary;
    };

    const title = isFullyBooked?"Slot is fully booked":isBlocked?"Slot is currently unavailable for bookings":
    isPast ? "This time slot has passed" : haveSlotBookedInFuture?"You have a booked appointment already.": undefined;

    return (
        <button
            onClick={(e) => !isDisabled && onSelect(slot.day,slot.id, e)}
            disabled={isDisabled}
            className={`flex flex-row items-center justify-start p-3 rounded-lg border transition-all ${
                isDisabled ? "cursor-not-allowed opacity-60" : "hover:shadow-md cursor-pointer"
            }`}
            style={{
                backgroundColor: getBackgroundColor(),
                borderColor: getBorderColor(),
            }}
            title={title}
        >
            <div
                className="flex items-center gap-1"
                style={{
                    ...typography.caption,
                    fontWeight: "700",
                    color: getTextColor(),
                }}
            >
                <span>{formatTime(slot.startTime)}</span>
                <span style={{ color: isPast ? colors.textMuted : colors.borderMedium }}>-</span>
                <span>{formatTime(slot.endTime)}</span>
            </div>
        </button>
    );
};

export default SlotButton;
