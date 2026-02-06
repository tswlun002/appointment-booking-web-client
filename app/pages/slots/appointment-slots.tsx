
import {ArrowLeft, MapPin} from "lucide-react";
import {colors} from "~/resources/colors/colors";
import {useSlotModelView} from "~/model/slot/SlotModelView";
import {LocalDate} from "~/utils/CompanionObjects";

const AppointmentSlots = () => {
    const {state,model,responseData, days} = useSlotModelView();
    const month = model.yearMonth().month;
    const year = model.yearMonth().year;

    const currentDaySlots = responseData.get(state.userData.fromDate!)??[];

    return (
        /* Main Container: Full screen height to keep header at top */
        <div className="w-full max-w-[900px] h-[90vh] md:h-[800px] mt-4 rounded-sm shadow-xl flex flex-col overflow-hidden bg-white mx-auto">

            {/* STICKY HEADER: Always at the top */}
            <div
                className="px-6 py-4 border-b z-10 flex-shrink-0"
                style={{backgroundColor: colors.bgLight, borderColor: colors.borderLight}}
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={e=>model.backToBranch(e)}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-6 w-6" style={{color: colors.textSecondary}} />
                    </button>
                    <div>
                        <p className="font-bold text-lg leading-tight" style={{color: colors.textSecondary}}>
                            {state.branchName}
                        </p>
                        {/* Display if distance search by user coordinates */}
                        {
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" style={{color: colors.red}}/>
                                <p className="text-xs font-bold" style={{color: colors.red}}>
                                    {state.distance} away
                                </p>
                            </div>
                        }
                    </div>
                </div>
            </div>

            {/* SCROLLABLE CONTENT AREA */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

                {/* Date Header */}
                <div className="mb-6">
                    <h4 className="text-xl font-bold" style={{color: colors.primary}}>Select Date</h4>
                    <p className="text-xs font-bold" style={{color: colors.textMuted}}>
                        {month} {year}
                    </p>
                </div>

                {/* Date Selection Circles */}
                <div className="flex flex-row gap-6 overflow-x-auto pb-6 border-b mb-6 p-2" style={{borderColor: colors.borderLight}}>
                    {days?.map(date => {

                        const isSelected = state.userData.fromDate === date;
                        const daySub =LocalDate.shortDayName(new Date(date));
                        const  dateOfTheMonth = LocalDate.dayOfTheMonth(new Date(date));

                        const isFullyBooked = state.userData.status==='FULLY_BOOKED';
                        const isBlocked = state.userData.status==='BLOCKED';
                        return (
                            <div key={date} className="flex flex-col items-center gap-2 mb-2">
                                <p className="text-[10px] font-bold uppercase" style={{color: colors.textMuted}}>
                                    {daySub}
                                </p>
                                <button
                                    disabled={isFullyBooked }
                                    onClick={e => model.selectedDay(date,e)}
                                    className={`relative flex items-center justify-center rounded-full w-12 h-12 text-sm font-bold transition-all border-2
                                               ${isFullyBooked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`
                                            }
                                    style={{
                                        backgroundColor: isSelected ? colors.primary : 'transparent',
                                        borderColor: isSelected ? colors.primary : colors.borderLight,
                                        color: isSelected ? colors.bgWhite : colors.textSecondary
                                    }}
                                >
                                    {dateOfTheMonth}
                                    {!isSelected && (
                                        <div className={`absolute -bottom-1 w-2.5 h-2.5 rounded-full ${isBlocked? 'bg-gray-800':`${isFullyBooked?'bg-red-500':'bg-green-500'}`}`} />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Slots Legend & Header */}
                <div className="flex flex-row justify-between items-center mb-4">
                    <h4 className="text-lg font-bold" style={{color: colors.textSecondary}}>
                        Available Times
                    </h4>

                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                            <span className="text-[10px] font-bold uppercase tracking-tight" style={{color: colors.textMuted}}>Available</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            <span className="text-[10px] font-bold uppercase tracking-tight" style={{color: colors.textMuted}}>Full</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-gray-800" />
                            <span className="text-[10px] font-bold uppercase tracking-tight" style={{color: colors.textMuted}}>Blocked</span>
                        </div>
                    </div>
                </div>

                {/* Slots Grid */}
                {
                    currentDaySlots && currentDaySlots.length> 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {currentDaySlots.map(slot => {

                             const isSelected = state.userData.selectedSlotId === slot.id;
                            return (
                                <button
                                    onClick={e => model.selectSlot(slot.id,e)}
                                    key={slot.id}
                                    className="flex flex-row items-center justify-start p-3 rounded-lg border-1 transition-all hover:shadow-md cursor-pointer"
                                    style={{
                                        backgroundColor: isSelected ? colors.primary : 'transparent',
                                        borderColor: isSelected ? colors.primary : colors.borderLight,

                                    }}
                                >
                                    <div className="flex items-center gap-1 font-bold text-[11px]"
                                         style={{  color: isSelected ? colors.bgWhite : colors.textSecondary}}>
                                        <span>{model.sliceTime(slot.startTime)}</span>
                                        <span className="text-gray-300">-</span>
                                        <span>{model.sliceTime(slot.endTime)}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-10 text-center border-2 border-dashed rounded-lg" style={{borderColor: colors.borderLight}}>
                        <p className="text-sm font-medium" style={{color: colors.textMuted}}>
                            No slots available for this date.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppointmentSlots;