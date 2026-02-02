import React, {useState} from 'react';
import {ChevronDown, ChevronUp, MapPin} from "lucide-react";
type BranchItemProps = {
    branchId:string, name:string, distanceKm:number, fullAddress:string
}

const BranchItem = ({branchId, name, distanceKm, fullAddress}:BranchItemProps) => {
    const [openBranchId, setOpenBranchId] = useState<string>("");
    const toggleHours = (id: string) => {
        setOpenBranchId(openBranchId === id ? "" : id);
    };
    return (
        <div key={branchId} className="flex flex-col border-b-[0.8px] border-[#3a3a3a1a] last:border-0 hover:bg-blue-50/30 transition-colors">
            <div className="px-6 py-4">
                <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                        <div className="mt-1">
                            <MapPin className="text-[#C83C37] h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-bold text-lg text-[#3a3a3a]">{name}</p>
                            <p className="text-xs font-bold text-[#2f70ef] mt-1">{distanceKm} away</p>
                        </div>
                    </div>
                    <button
                        onClick={() => toggleHours(branchId)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        {openBranchId === branchId ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                    </button>
                </div>

                <p className="text-sm text-gray-600 mt-2 ml-8 leading-snug">
                    {fullAddress}
                </p>

                {/* Operating Hours Dropdown */}
                {openBranchId === branchId && (
                    <div className="mt-4 ml-8 bg-white border border-gray-100 p-4 rounded shadow-inner animate-in slide-in-from-top-2 duration-200">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Standard Operating Hours</p>
                        <ul className="text-sm space-y-2 text-gray-700">
                            <li className="flex justify-between border-b border-gray-50 pb-1"><span>Mon - Fri:</span> <span>08:00 - 17:00</span></li>
                            <li className="flex justify-between border-b border-gray-50 pb-1"><span>Saturday:</span> <span>08:00 - 13:00</span></li>
                            <li className="flex justify-between text-red-500"><span>Sunday:</span> <span className="font-medium">Closed</span></li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BranchItem;