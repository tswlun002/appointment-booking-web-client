import { colors, typography } from "~/resources/colors/colors";

interface LegendItemProps {
    color: string;
    label: string;
}

/** Legend item for slot status */
const LegendItem = ({ color, label }: LegendItemProps) => (
    <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span style={{ ...typography.caption, fontWeight: "700", textTransform: "uppercase", color: colors.textMuted }}>
            {label}
        </span>
    </div>
);

export default LegendItem;
