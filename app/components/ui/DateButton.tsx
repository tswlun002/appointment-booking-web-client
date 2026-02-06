import { colors, typography } from "~/resources/colors/colors";
import { LocalDate } from "~/utils/CompanionObjects";
import type { MouseEvent } from "react";

interface DateButtonProps {
    date: string;
    isSelected: boolean;
    isFullyBooked: boolean;
    isBlocked: boolean;
    onSelect: (date: string, e: MouseEvent<HTMLButtonElement>) => void;
}

/** Date selection button */
const DateButton = ({
    date,
    isSelected,
    isFullyBooked,
    isBlocked,
    onSelect,
}: DateButtonProps) => {
    const dayShort = LocalDate.shortDayName(new Date(date));
    const dayOfMonth = LocalDate.dayOfTheMonth(new Date(date));

    const getStatusIndicatorColor = () => {
        if (isBlocked) return colors.primaryDark;
        if (isFullyBooked) return colors.red;
        return colors.success;
    };

    return (
        <div className="flex flex-col items-center gap-2 mb-2">
            <p style={{ ...typography.caption, fontWeight: "700", textTransform: "uppercase", color: colors.textMuted }}>
                {dayShort}
            </p>
            <button
                disabled={isFullyBooked}
                onClick={(e) => onSelect(date, e)}
                className={`relative flex items-center justify-center rounded-full w-12 h-12 transition-all border-2
                    ${isFullyBooked ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-110"}`}
                style={{
                    ...typography.bodySmall,
                    fontWeight: "700",
                    backgroundColor: isSelected ? colors.primary : "transparent",
                    borderColor: isSelected ? colors.primary : colors.borderLight,
                    color: isSelected ? colors.white : colors.textSecondary,
                }}
            >
                {dayOfMonth}
                {!isSelected && (
                    <div
                        className="absolute -bottom-1 w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: getStatusIndicatorColor() }}
                    />
                )}
            </button>
        </div>
    );
};

export default DateButton;
