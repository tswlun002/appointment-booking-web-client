import React, {useState} from 'react';
import {ChevronDown, ChevronUp, MapPin} from "lucide-react";
import { colors } from "~/resources/colors/colors";

type BranchItemProps = {
    branchId:string, name:string, distanceKm:number, fullAddress:string
}

const BranchItem = ({branchId, name, distanceKm, fullAddress}:BranchItemProps) => {
    const [openBranchId, setOpenBranchId] = useState<string>("");
    const toggleHours = (id: string) => {
        setOpenBranchId(openBranchId === id ? "" : id);
    };
    return (
        <div
            key={branchId}
            className="flex flex-col last:border-0 hover:opacity-90 transition-colors"
            style={{ borderBottomWidth: 1, borderColor: colors.borderLight }}
        >
            <div className="px-6 py-4">
                <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                        <div className="mt-1">
                        <MapPin className="h-5 w-5" style={{ color: colors.red }} />
                        </div>
                        <div>
                            <p
                                className="font-bold text-lg"
                                style={{ color: colors.textSecondary }}
                            >
                                {name}
                            </p>
                            <p
                                className="text-xs font-bold mt-1"
                                style={{ color: colors.primary }}
                            >
                                {distanceKm} away
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => toggleHours(branchId)}
                        className="p-2 rounded-full transition-colors"
                        style={{ backgroundColor: 'transparent' }}
                    >
                        {openBranchId === branchId
                            ? <ChevronUp style={{ color: colors.textLight }} />
                            : <ChevronDown style={{ color: colors.textLight }} />
                        }
                    </button>
                </div>

                <p
                    className="text-sm mt-2 ml-8 leading-snug"
                    style={{ color: colors.textMuted }}
                >
                    {fullAddress}
                </p>

                {/* Operating Hours Dropdown */}
                {openBranchId === branchId && (
                    <div
                        className="mt-4 ml-8 p-4 rounded shadow-inner animate-in slide-in-from-top-2 duration-200"
                        style={{
                            backgroundColor: colors.bgWhite,
                            borderWidth: 1,
                            borderColor: colors.borderLight
                        }}
                    >
                        <p
                            className="text-xs font-bold uppercase mb-2"
                            style={{ color: colors.textLight }}
                        >
                            Standard Operating Hours
                        </p>
                        <ul className="text-sm space-y-2">
                            <li
                                className="flex justify-between pb-1"
                                style={{
                                    color: colors.textSecondary,
                                    borderBottomWidth: 1,
                                    borderColor: colors.bgLight
                                }}
                            >
                                <span>Mon - Fri:</span> <span>08:00 - 17:00</span>
                            </li>
                            <li
                                className="flex justify-between pb-1"
                                style={{
                                    color: colors.textSecondary,
                                    borderBottomWidth: 1,
                                    borderColor: colors.bgLight
                                }}
                            >
                                <span>Saturday:</span> <span>08:00 - 13:00</span>
                            </li>
                            <li
                                className="flex justify-between"
                                style={{ color: colors.red }}
                            >
                                <span>Sunday:</span> <span className="font-medium">Closed</span>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BranchItem;