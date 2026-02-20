import { colors, typography } from "~/resources/colors/colors";
import { emptySlotsResources } from "~/resources/label/slots-labels";

/** Empty state when no slots available */
const EmptySlots = () => (
    <div
        className="py-10 text-center border-2 border-dashed rounded-lg"
        style={{ borderColor: colors.borderLight }}
    >
        <p style={{ ...typography.bodySmall, fontWeight: "500", color: colors.textMuted }}>
            {emptySlotsResources.message}
        </p>
    </div>
);

export default EmptySlots;
