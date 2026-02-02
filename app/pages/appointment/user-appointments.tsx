import React, { useState } from 'react';
import BranchLocator from "~/pages/branch/branch-locator";
import { BranchLocatorScreenResources } from "~/resources/label/branch-labels";
import { CalendarClock, XCircle, RotateCcw, Info, MapPin, ChevronDown, ChevronUp } from "lucide-react";

const UserAppointments = () => {
    // 1. Added a 'Being Processed' item
    // 2. Added 'address' field to each appointment
    const [appointments] = useState([
        { id: 1, title: "General Checkup", status: "booked", date: "12 Feb 2026", branch: "Rondebosch Branch", address: "Shop G21, Fountain Centre, Main Rd, 7700" },
        { id: 2, title: "Dental Cleaning", status: "cancelled", date: "05 Jan 2026", branch: "Claremont Branch", address: "123 Main Road, Claremont, 7708" },
        { id: 4, title: "Cardiology Review", status: "being processed", date: "01 Feb 2026", branch: "Wynberg Branch", address: "Medical Suites, Main Road, 7800" },
    ]);

    // State to track which info section is expanded
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleInfo = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'booked': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            case 'rescheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'being processed': return 'bg-amber-100 text-amber-700 border-amber-300 animate-pulse';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col md:flex-row items-center justify-between p-[2.5%] overflow-hidden">
            <div className={`absolute inset-0 z-0 opacity-40 bg-[url('${BranchLocatorScreenResources.backgroundImage}')] bg-cover bg-center bg-no-repeat`} />

            {/* Items Section */}
            {appointments.length > 0 && (
                <div className="relative z-10 w-full md:w-[35%] h-[90vh] flex flex-col justify-center">
                    <div className="bg-white/95 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-2xl flex flex-col h-full max-h-[850px]">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Your Appointments</h2>

                        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                            {appointments.map((app) => (
                                <div key={app.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm transition-all">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="font-bold text-gray-900 text-lg leading-tight">{app.title}</p>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-tighter ${getStatusStyle(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-3">{app.date}</p>

                                    {/* View More/Hide Toggle */}
                                    <button
                                        onClick={() => toggleInfo(app.id)}
                                        className="flex items-center gap-1 text-xs font-bold text-[#2f70ef] mb-3 hover:underline"
                                    >
                                        <Info size={14} />
                                        {expandedId === app.id ? "Hide info" : "View more info"}
                                        {expandedId === app.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                    </button>

                                    {/* Expanded Branch Info */}
                                    {expandedId === app.id && (
                                        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div className="flex gap-2 text-gray-700">
                                                <MapPin size={16} className="text-red-500 shrink-0 mt-1" />
                                                <div className="text-sm">
                                                    <p className="font-bold">{app.branch}</p>
                                                    <p className="text-gray-500">{app.address}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-50">
                                        {app.status === 'being processed' ? (
                                            <div className="w-full text-center py-2 text-xs font-medium text-amber-600 bg-amber-50 rounded-lg">
                                                Please wait while we confirm your details...
                                            </div>
                                        ) : app.status !== 'cancelled' ? (
                                            <>
                                                <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50">
                                                    <XCircle size={14} /> Cancel
                                                </button>
                                                <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-blue-200 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50">
                                                    <CalendarClock size={14} /> Reschedule
                                                </button>
                                            </>
                                        ) : (
                                            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#2f70ef] text-white rounded-lg text-sm font-bold hover:bg-blue-700">
                                                <RotateCcw size={16} /> Rebook Appointment
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="relative z-10 w-full md:w-[55%] flex justify-end items-center">
                <BranchLocator />
            </div>
        </div>
    );
};

export default UserAppointments;