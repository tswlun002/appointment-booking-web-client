import { colors, typography } from "~/resources/colors/colors";
import type { SlotResponse } from "~/domain/slot/generated/model";
import type { MouseEvent } from "react";

interface SlotButtonProps {
    slot: SlotResponse;
    isSelected: boolean;
    isPast: boolean;
    onSelect: (slotId: string, e: MouseEvent<HTMLButtonElement>) => void;
    formatTime: (time: string) => string;
}

/** Slot time button */
const SlotButton = ({ slot, isSelected, isPast, onSelect, formatTime }: SlotButtonProps) => {
    const isDisabled = isPast;

    const getBackgroundColor = () => {
        if (isPast) return colors.bgLight;
        if (isSelected) return colors.primary;
        return "transparent";
    };

    const getBorderColor = () => {
        if (isPast) return colors.borderLight;
        if (isSelected) return colors.primary;
        return colors.borderLight;
    };

    const getTextColor = () => {
        if (isPast) return colors.textMuted;
        if (isSelected) return colors.white;
        return colors.textSecondary;
    };

    return (
        <button
            onClick={(e) => !isDisabled && onSelect(slot.id, e)}
            disabled={isDisabled}
            className={`flex flex-row items-center justify-start p-3 rounded-lg border transition-all ${
                isDisabled ? "cursor-not-allowed opacity-60" : "hover:shadow-md cursor-pointer"
            }`}
            style={{
                backgroundColor: getBackgroundColor(),
                borderColor: getBorderColor(),
            }}
            title={isPast ? "This time slot has passed" : undefined}
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
