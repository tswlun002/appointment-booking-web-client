import {useBranchLocatorModelView} from "~/model/branch/BranchLocatorModelView";
import type {
    BranchLocation,
    FindNearestBranchesParams,
    SearchBranchesByAreaParams,
} from "~/domain/branch-locator/generated/model";
import BranchItem from "~/pages/branch/branchItem";
import { CustomerSearchInput} from "~/components/ui/inputs";
import Error from "~/components/ui/error";
import { colors, typography } from "~/resources/colors/colors";
import {BranchLocatorScreenResources} from "~/resources/label/branch-labels";
import { SendHorizonal, ChevronDown} from "lucide-react";
import { Spinner } from "~/components/ui/spinner";

const BranchLocator = () => {

    const {state, model, branches} = useBranchLocatorModelView();

    const branchesElements = branches?.map((branch: BranchLocation) => (
        <BranchItem
            key={branch.branchId}
            branchId={branch.branchId}
            name={branch.name}
            distanceKm={branch.distanceKm}
            fullAddress={branch.fullAddress}
            operationTimes={branch.operationTimes}
        />
    ));

    const inputValue = (state.userData as SearchBranchesByAreaParams)?.searchText??""

    const isResponse = state.errors?.response?.isError || state?.response?.isSuccess;
    const responseStyle = {color: state.errors?.response?.isError ? colors.red : colors.success};
    const responseMessage = state.errors?.response?.message || ""
    const responseElement = isResponse && <Error style={responseStyle} message={responseMessage as string}></Error>
    const hasBranches = branches && branches.length > 0;


    const distanceKm = (state.userData as FindNearestBranchesParams).maxDistanceKm


        return (
        <div className="flex flex-col w-full items-start justify-start gap-4">
            <div
                className="search-section w-full min-h-[450px] rounded-md bg-no-repeat flex flex-col items-center md:items-start p-4 md:p-10 mt-[5%]">

                <div
                    className="backdrop-blur-xs w-full max-w-[544px] text-left rounded-sm p-6 shadow-lg"
                    style={{backgroundColor: `${colors.bgWhite}33`}}
                >
                    {responseElement}

                    <h3
                        className="text-2xl md:text-3xl font-bold py-4 tracking-tight"
                        style={{color: colors.textPrimary}}
                    >
                        {BranchLocatorScreenResources.heading}
                    </h3>
                    <p
                        className="text-sm mb-4"
                        style={{color: colors.textMuted}}
                    >
                        {BranchLocatorScreenResources.subheading}
                    </p>


                    <form className="space-y-4" onSubmit={e => model.searchByCurrentLocation(e)}>
                        {/* Distance Filter */}
                        <div className="flex flex-wrap gap-3 justify-start items-end">
                            <label
                                style={{ color: colors.textMuted }}
                                className="text-sm mb-4"
                            >
                                {BranchLocatorScreenResources.distanceFilter.label}
                            </label>

                            {/* Container for buttons */}
                            <div className="flex flex-wrap gap-0">
                                {state.DISTANCES.map((distance) => {
                                    const isSelected = distanceKm === distance;
                                    return (
                                        <button
                                            id={BranchLocatorScreenResources.distanceFilter.id}
                                            key={distance}
                                            type="button"
                                            onClick={e => model.onFilterEvent(BranchLocatorScreenResources.distanceFilter.id, e, distance)}
                                            /* Distance buttons use px-3 and min-h-[40px] */
                                            className="flex items-center justify-center cursor-pointer min-h-[40px] px-3 hover:opacity-90 transition-all font-small text-sm whitespace-nowrap"
                                            style={{
                                                borderWidth: 1,
                                                borderColor: colors.primaryDark,
                                                color: isSelected ? colors.bgWhite : colors.primaryDark,
                                                backgroundColor: isSelected ? colors.primaryDark : colors.bgWhite
                                            }}
                                        >
                                            {distance}km
                                        </button>
                                    );
                                })}

                                {/* Submit Button - Updated to match style exactly */}
                                <button
                                    type="submit"
                                    className="flex items-center justify-center text-center cursor-pointer min-h-[40px] px-3 hover:opacity-90 transition-all font-small text-sm whitespace-nowrap"
                                    style={{
                                        borderWidth: 1,
                                        borderColor: colors.primary,
                                        color: colors.white,
                                        backgroundColor: colors.primary
                                    }}
                                >
                                    {BranchLocatorScreenResources.enableLocation.label}
                                    <SendHorizonal  className="h-4"/>
                                </button>
                            </div>
                        </div>
                    </form>
                    <div className="flex justify-center items-center pt-2 font-bold" style={{color:colors.primaryDark}}><h2>OR</h2></div>
                    <form className="space-y-4 mt-4" onSubmit={e => model.submit(e)}>
                        <CustomerSearchInput
                            id={BranchLocatorScreenResources.searchText.id}
                            label={BranchLocatorScreenResources.searchText.label}
                            value={inputValue}
                            onChange={model.onChange}
                            error={state.errors}
                            />
                    </form>
                </div>

                {/* Results List Section - Only show when branches available */}
                {hasBranches && (
                    <div
                        className="operation-hours backdrop-blur-xs w-full max-w-[544px] mt-4 rounded-sm shadow-xl flex flex-col overflow-hidden"
                        style={{ backgroundColor: `${colors.bgWhite}cc` }}
                    >
                        <div
                            className="px-6 py-2 text-xs font-bold uppercase tracking-wider"
                            style={{
                                backgroundColor: colors.bgLight,
                                borderBottomWidth: 1,
                                borderColor: colors.borderLight,
                                color: colors.textMuted
                            }}
                        >
                            {BranchLocatorScreenResources.branchesList.label}
                        </div>

                        {/* Scrollable List Area */}
                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                            {branchesElements}

                            {/* Load More Button */}
                            {model.hasMore && (
                                <button
                                    onClick={() => model.loadMoreBranches()}
                                    disabled={state.isLoading}
                                    className="w-full flex items-center justify-center gap-2 py-3 hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        backgroundColor: colors.bgLight,
                                        color: colors.textSecondary,
                                        borderTopWidth: 1,
                                        borderColor: colors.borderLight,
                                        ...typography.button
                                    }}
                                    aria-label={BranchLocatorScreenResources.loadMoreButton.label}
                                >
                                    {state.isLoading ? (
                                        <>
                                            <Spinner color={colors.textSecondary} className="h-4 w-4" />
                                            <span>{BranchLocatorScreenResources.loadMoreButton.loadingLabel}</span>
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown size={16} />
                                            <span>{BranchLocatorScreenResources.loadMoreButton.label}</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BranchLocator;

