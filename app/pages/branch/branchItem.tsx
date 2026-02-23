import {ChevronDown, ChevronUp, MapPin} from "lucide-react";
import { colors } from "~/resources/colors/colors";
import type {BranchLocationOperationTimes} from "~/domain/branch-locator/generated/model";
import OperationTimes from "~/pages/branch/operation-times";
import { isNotBlank} from '~/utils/CompanionObjects';
import {BranchItemResources} from "~/resources/label/branch-labels";
import {BranchItemModelView, useBranchItemModelView} from "~/model/branch/BranchItemModelView";

type BranchItemProps = {
    branchId:string, name:string, distanceKm:number, fullAddress:string,
    operationTimes:BranchLocationOperationTimes,
    searchType:"latLong"|"area"
}

const BranchItem = ({branchId, name, distanceKm, fullAddress, operationTimes,searchType}:BranchItemProps) => {


    const {state, model} = useBranchItemModelView();

    const OperationElements = (state.userData.viewedBranch === branchId && operationTimes) ?
        Object.entries(operationTimes)
            .sort((a, b) => BranchItemModelView.sort(a[0], b[0]))
            .map(([date, tradingHours]) => (
                <OperationTimes
                    key={date}
                    day={BranchItemModelView.getDayName(date)}
                    startAt={isNotBlank(tradingHours.openAt) ? BranchItemModelView.getHourMinutesFormat(tradingHours.openAt!) : ""}
                    closeAT={isNotBlank(tradingHours.closeAt) ? BranchItemModelView.getHourMinutesFormat(tradingHours.closeAt!) : ""}
                    isClosed={tradingHours.closed}
                    isHoliday={tradingHours.isHoliday}
                />
            )) : []

    return (
        <div
            key={branchId}
            className="flex flex-col last:border-0 hover:opacity-90 transition-colors"
            style={{ borderBottomWidth: 1, borderColor: colors.borderLight }}
        >
            <div className="px-6 py-4">
                {/* Header: Name and Toggle */}
                <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                        <div className="mt-1">
                            <MapPin className="h-5 w-5" style={{ color: colors.red }} />
                        </div>
                        <div>
                            <p className="font-bold text-lg" style={{ color: colors.textSecondary }}>
                                {name}
                            </p>
                            {((searchType!=='area' && distanceKm != null) )&& (
                                <p className="text-xs font-bold mt-1" style={{ color: colors.primary }}>
                                    {`${distanceKm}km away`}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={e => model.onView(BranchItemResources.viewMoreButton.id,branchId,e)}
                        className="p-2 rounded-full transition-colors"
                    >
                        {state.userData.viewStatus
                            ? <ChevronUp style={{ color: colors.textLight }} />
                            : <ChevronDown style={{ color: colors.textLight }} />
                        }
                    </button>
                </div>

                {/* Address and Booking Button Container */}
                <div className="flex flex-wrap items-end justify-between gap-4 mt-2 ml-8">
                    <p
                        className="text-sm leading-snug flex-1 min-w-[250px]"
                        style={{ color: colors.textMuted }}
                    >
                        {fullAddress}
                    </p>

                    <button
                        id={BranchItemResources.bookAppointmentButton.id}
                        type="button"
                        className="flex items-center justify-center cursor-pointer min-h-[40px] px-6 rounded shadow-sm hover:opacity-95 transition-all font-bold text-sm whitespace-nowrap w-full sm:w-auto"
                        style={{
                            backgroundColor: colors.primary,
                            color: colors.bgWhite
                        }}
                        onClick={e=>model.onBook(branchId,name, distanceKm != null ? `${distanceKm}km` : "",e)}
                    >
                        {BranchItemResources.bookAppointmentButton.label}
                    </button>
                </div>

                {/* Operating Hours Section */}
                {(operationTimes && state.userData.viewStatus) && (
                    <div
                        className="mt-4 ml-8 p-4 rounded shadow-inner animate-in slide-in-from-top-2 duration-200"
                        style={{
                            backgroundColor: colors.bgWhite,
                            borderWidth: 1,
                            borderColor: colors.borderLight
                        }}
                    >
                        <p className="text-xs font-bold uppercase mb-2" style={{ color: colors.textLight }}>
                            {BranchItemResources.branchItemHeader.label}
                        </p>
                        {OperationElements}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BranchItem;