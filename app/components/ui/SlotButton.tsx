import { colors, typography } from "~/resources/colors/colors";
import type { SlotResponse } from "~/domain/slot/generated/model";
import type { MouseEvent } from "react";

interface SlotButtonProps {
    slot: SlotResponse;
    isSelected: boolean;
    onSelect: (slotId: string, e: MouseEvent<HTMLButtonElement>) => void;
    formatTime: (time: string) => string;
}

/** Slot time button */
const SlotButton = ({ slot, isSelected, onSelect, formatTime }: SlotButtonProps) => (
    <button
        onClick={(e) => onSelect(slot.id, e)}
        className="flex flex-row items-center justify-start p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer"
        style={{
            backgroundColor: isSelected ? colors.primary : "transparent",
            borderColor: isSelected ? colors.primary : colors.borderLight,
        }}
    >
        <div
            className="flex items-center gap-1"
            style={{
                ...typography.caption,
                fontWeight: "700",
                color: isSelected ? colors.white : colors.textSecondary,
            }}
        >
            <span>{formatTime(slot.startTime)}</span>
            <span style={{ color: colors.borderMedium }}>-</span>
            <span>{formatTime(slot.endTime)}</span>
        </div>
    </button>
);

export default SlotButton;
