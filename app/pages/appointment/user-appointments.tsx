import React, { useState } from 'react';
import BranchLocator from "~/pages/branch/branch-locator";
import { BranchLocatorScreenResources } from "~/resources/label/branch-labels";
import { CalendarClock, XCircle, RotateCcw, Info, MapPin, ChevronDown, ChevronUp, Search, Calendar } from "lucide-react";
import { colors, getStatusColors } from "~/resources/colors/colors";

type MobileTab = 'branch' | 'appointments';

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

    // State for mobile tab navigation
    const [activeTab, setActiveTab] = useState<MobileTab>('branch');

    const toggleInfo = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const getStatusStyle = (status: string) => {
        const statusColor = getStatusColors(status);
        const baseStyle: React.CSSProperties = {
            backgroundColor: statusColor.bg,
            color: statusColor.text,
            borderColor: statusColor.border,
        };
        return baseStyle;
    };

    const isBeingProcessed = (status: string) => status === 'being processed';

    // Appointments Widget Component
    const AppointmentsWidget = () => (
        <div
            className="backdrop-blur-md p-6 rounded-xl shadow-2xl flex flex-col h-full max-h-[850px]"
            style={{
                backgroundColor: `${colors.bgWhite}f2`,
                borderColor: `${colors.bgWhite}33`,
                borderWidth: 1
            }}
        >
            <h2
                className="text-2xl font-bold mb-6 border-b pb-4"
                style={{ color: colors.textPrimary, borderColor: colors.borderLight }}
            >
                Your Appointments
            </h2>

            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {appointments.map((app) => (
                    <div
                        key={app.id}
                        className="p-4 rounded-xl shadow-sm transition-all"
                        style={{
                            backgroundColor: colors.bgWhite,
                            borderColor: colors.borderLight,
                            borderWidth: 1
                        }}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <p
                                className="font-bold text-lg leading-tight"
                                style={{ color: colors.textPrimary }}
                            >
                                {app.title}
                            </p>
                            <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-tighter ${isBeingProcessed(app.status) ? 'animate-pulse' : ''}`}
                                style={getStatusStyle(app.status)}
                            >
                                {app.status}
                            </span>
                        </div>
                        <p
                            className="text-sm mb-3"
                            style={{ color: colors.textMuted }}
                        >
                            {app.date}
                        </p>

                        {/* View More/Hide Toggle */}
                        <button
                            onClick={() => toggleInfo(app.id)}
                            className="flex items-center gap-1 text-xs font-bold mb-3 hover:underline"
                            style={{ color: colors.primary }}
                        >
                            <Info size={14} />
                            {expandedId === app.id ? "Hide info" : "View more info"}
                            {expandedId === app.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                        </button>

                        {/* Expanded Branch Info */}
                        {expandedId === app.id && (
                            <div
                                className="mb-4 p-3 rounded-lg animate-in fade-in slide-in-from-top-1 duration-200"
                                style={{
                                    backgroundColor: colors.bgLight,
                                    borderColor: colors.borderLight,
                                    borderWidth: 1
                                }}
                            >
                                <div className="flex gap-2">
                                    <MapPin size={16} className="shrink-0 mt-1" style={{ color: colors.red }} />
                                    <div className="text-sm">
                                        <p className="font-bold" style={{ color: colors.textSecondary }}>{app.branch}</p>
                                        <p style={{ color: colors.textMuted }}>{app.address}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div
                            className="flex flex-wrap gap-2 pt-3 border-t"
                            style={{ borderColor: colors.bgLight }}
                        >
                            {app.status === 'being processed' ? (
                                <div
                                    className="w-full text-center py-2 text-xs font-medium rounded-lg"
                                    style={{
                                        color: colors.warning,
                                        backgroundColor: colors.warningLight
                                    }}
                                >
                                    Please wait while we confirm your details...
                                </div>
                            ) : app.status !== 'cancelled' ? (
                                <>
                                    <button
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border rounded-lg text-xs font-bold hover:opacity-80 transition-opacity"
                                        style={{
                                            borderColor: colors.redBorder,
                                            color: colors.red
                                        }}
                                    >
                                        <XCircle size={14} /> Cancel
                                    </button>
                                    <button
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border rounded-lg text-xs font-bold hover:opacity-80 transition-opacity"
                                        style={{
                                            borderColor: colors.primary,
                                            color: colors.primary
                                        }}
                                    >
                                        <CalendarClock size={14} /> Reschedule
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
                                    style={{
                                        backgroundColor: colors.primary,
                                        color: colors.white
                                    }}
                                >
                                    <RotateCcw size={16} /> Rebook Appointment
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="relative min-h-screen w-full flex flex-col md:flex-row items-center justify-between p-[2.5%] pb-20 md:pb-[2.5%] overflow-hidden">
            <div
                className="absolute inset-0 z-0 opacity-40 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('${BranchLocatorScreenResources.backgroundImage}')` }}
            />

            {/* Desktop Layout */}
            {/* Appointments Section - Hidden on mobile */}
            {appointments.length > 0 && (
                <div className="relative z-10 w-full md:w-[35%] h-[90vh] hidden md:flex flex-col justify-center">
                    <AppointmentsWidget />
                </div>
            )}

            {/* Branch Locator - Hidden on mobile */}
            <div className="relative z-10 w-full md:w-[55%] hidden md:flex justify-end items-center">
                <BranchLocator />
            </div>

            {/* Mobile Layout - Show based on active tab */}
            <div className="relative z-10 w-full md:hidden flex flex-col min-h-[80vh]">
                {activeTab === 'branch' ? (
                    <BranchLocator />
                ) : (
                    <div className="w-full h-full flex flex-col justify-start pt-4">
                        <AppointmentsWidget />
                    </div>
                )}
            </div>

            {/* Mobile Bottom Navigation */}
            <div
                className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex shadow-lg"
                style={{
                    backgroundColor: colors.bgWhite,
                    borderTopWidth: 1,
                    borderColor: colors.borderLight
                }}
            >
                <button
                    onClick={() => setActiveTab('branch')}
                    className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors"
                    style={{
                        backgroundColor: activeTab === 'branch' ? colors.primaryLight : colors.bgWhite,
                        color: activeTab === 'branch' ? colors.primary : colors.textMuted
                    }}
                >
                    <Search size={20} />
                    <span className="text-xs font-semibold">Find Branch</span>
                </button>
                <button
                    onClick={() => setActiveTab('appointments')}
                    className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors"
                    style={{
                        backgroundColor: activeTab === 'appointments' ? colors.primaryLight : colors.bgWhite,
                        color: activeTab === 'appointments' ? colors.primary : colors.textMuted
                    }}
                >
                    <Calendar size={20} />
                    <span className="text-xs font-semibold">Appointments</span>
                </button>
            </div>
        </div>
    );
};

export default UserAppointments;