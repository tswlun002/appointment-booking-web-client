import {ArrowLeft, MapPin} from "lucide-react";
import {colors, typography} from "~/resources/colors/colors";
import {slotHeaderResources} from "~/resources/label/slots-labels";
import type {MouseEvent} from "react";

interface SlotHeaderProps {
    branchName: string;
    distance: string;
    onBack: (e: MouseEvent<HTMLButtonElement>) => void;
    mode: "default" | "reschedule";
}

/** Header with back button and branch info */
const SlotHeader = ({branchName, distance, onBack, mode}: SlotHeaderProps) => (
    <div
        className="px-6 py-4 border-b z-10 flex-shrink-0"
        style={{ backgroundColor: colors.bgLight, borderColor: colors.borderLight }}
    >
        <div className="flex items-center gap-4">
            <button
                onClick={onBack}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                aria-label={slotHeaderResources.backButton.ariaLabel}
            >
                <ArrowLeft className="h-6 w-6" style={{ color: colors.textSecondary }} />
            </button>
            <div>
                <p style={{ ...typography.bodyLarge, fontWeight: "700", color: colors.textSecondary }}>
                    {branchName}
                </p>
                {
                    mode === 'default' &&
                    <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" style={{color: colors.red}}/>

                        <p style={{...typography.caption, fontWeight: "700", color: colors.red}}>
                            {distance} {slotHeaderResources.distanceLabel}
                        </p>

                    </div>
                }
            </div>
        </div>
    </div>
);

export default SlotHeader;
