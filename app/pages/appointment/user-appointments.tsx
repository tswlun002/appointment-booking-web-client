import BranchLocator from "~/pages/branch/branch-locator";
import { BranchLocatorScreenResources } from "~/resources/label/branch-labels";
import { Search, Calendar } from "lucide-react";
import { colors } from "~/resources/colors/colors";
import { useUserAppointmentsModelView } from "~/model/appointment/UserAppointmentsModelView";
import AppointmentsWidget from "~/components/ui/AppointmentsWidget";
import { userAppointmentsScreenResources } from "~/resources/label/appointment-labels";

const UserAppointments = () => {
    const { appointments, model, state, cancelState, cancelModel } = useUserAppointmentsModelView();
    const activeTab = model.activeTab;

    return (
        <div className="relative min-h-screen w-full flex flex-col md:flex-row items-start justify-between  overflow-hidden">
            <div
                className="absolute inset-0 z-0 opacity-60 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('${BranchLocatorScreenResources.backgroundImage}')` }}
            />

            {/* Desktop Layout */}
            {/* Appointments Section - Hidden on mobile */}
            {appointments.length > 0 && (
                <div className="relative z-10 w-full md:w-[35%] h-[100vh] hidden md:flex flex-col justify-center">
                    <AppointmentsWidget state={state} model={model} appointments={appointments} cancelState={cancelState} cancelModel={cancelModel} />
                </div>
            )}

            {/* Branch Locator - Hidden on mobile */}
            <div className="relative z-10 w-full md:w-[55%] hidden md:flex justify-end items-center">
                <BranchLocator haveSlotBookedInFuture={model.haveSlotBookedInFuture()}/>
            </div>

            {/* Mobile Layout - Show based on active tab */}
            <div className="relative z-10 w-full md:hidden flex flex-col min-h-[80vh]">
                {activeTab === 'branch' ? (
                    <BranchLocator haveSlotBookedInFuture={model.haveSlotBookedInFuture()} />
                ) : (
                    <div className="w-full h-full flex flex-col justify-start pt-4">
                        <AppointmentsWidget state={state} model={model} appointments={appointments} cancelState={cancelState} cancelModel={cancelModel} />
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
                    onClick={() => model.setActiveTab('branch')}
                    className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors"
                    style={{
                        backgroundColor: activeTab === 'branch' ? colors.primaryLight : colors.bgWhite,
                        color: activeTab === 'branch' ? colors.primary : colors.textMuted
                    }}
                    aria-label={userAppointmentsScreenResources.mobileNav.findBranch.ariaLabel}
                >
                    <Search size={20} />
                    <span className="text-xs font-semibold">{userAppointmentsScreenResources.mobileNav.findBranch.label}</span>
                </button>
                <button
                    onClick={() => model.setActiveTab('appointments')}
                    className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors"
                    style={{
                        backgroundColor: activeTab === 'appointments' ? colors.primaryLight : colors.bgWhite,
                        color: activeTab === 'appointments' ? colors.primary : colors.textMuted
                    }}
                    aria-label={userAppointmentsScreenResources.mobileNav.appointments.ariaLabel}
                >
                    <Calendar size={20} />
                    <span className="text-xs font-semibold">{userAppointmentsScreenResources.mobileNav.appointments.label}</span>
                </button>
            </div>
        </div>
    );
};

export default UserAppointments;



