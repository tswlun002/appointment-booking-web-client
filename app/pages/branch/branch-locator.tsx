import { Search} from "lucide-react";
import {useBranchLocatorModelView} from "~/model/branch/BranchLocatorModelView";
import type {
    BranchLocation,
    BranchSearchResponse, FindNearestBranchesParams,
    NearbyBranchesResponse, SearchBranchesByAreaParams,
} from "~/domain/branch-locator/generated/model";
import BranchItem from "~/pages/branch/branchItem";
import {CustomerInput} from "~/components/ui/inputs";
import Error from "~/components/ui/error";
import { colors } from "~/resources/colors/colors";

const BranchLocator = () => {

    const{state, model} =useBranchLocatorModelView();

     let  branches = [] as BranchLocation[];
    if(state.searchType=="area"){
        const data = state.response?.data as BranchSearchResponse || [] ;
         branches = data.branches || [] as BranchLocation[];
    }
    else if(state.searchType=="latLong"){
        const data = state.response?.data as NearbyBranchesResponse || [] as BranchLocation[] ;
        branches = data.branches ;
    }
    console.log(state);


    const branchesElements =  branches?.map((branch) => (
         <BranchItem
             branchId={branch.branchId}
             name={branch.name} distanceKm={branch.distanceKm}
             fullAddress={branch.fullAddress}
         />
    ));

    const inputValue = state.searchType=='area'?(state.userData as SearchBranchesByAreaParams).searchText:""

    const isResponse = state.errors?.response?.isError || state?.response?.isSuccess;
    const responseStyle = { color: state.errors?.response?.isError ? colors.red : colors.success };
    const responseMessage =state.errors?.response?.message||""
    const responseElement  =  isResponse&&<Error style={responseStyle} message={responseMessage as string }></Error>
    const hasBranches = branches && branches.length > 0;

    return (
        <div className="flex flex-col w-full items-start justify-start gap-4">
            <div className="search-section w-full min-h-[450px] rounded-md bg-no-repeat flex flex-col items-center md:items-start p-4 md:p-10 mt-[5%]">

                <div
                    className="backdrop-blur-xs w-full max-w-[544px] text-left rounded-sm p-6 shadow-lg"
                    style={{ backgroundColor: `${colors.bgWhite}33` }}
                >
                    <h3
                        className="text-2xl md:text-3xl font-bold py-4 tracking-tight"
                        style={{ color: colors.textPrimary }}
                    >
                        Find a branch
                    </h3>
                    <p
                        className="text-sm mb-4"
                        style={{ color: colors.textMuted }}
                    >
                        Search by location or enable GPS to find branches near you
                    </p>

                    {responseElement}

                    <form className="space-y-4" onSubmit={e => model.searchByCurrentLocation(e)}>
                        <button
                            type="submit"
                            className="flex items-center justify-center text-center rounded-full cursor-pointer min-h-[44px] md:min-h-[48px] w-full sm:w-auto py-2 px-4 md:px-6 hover:opacity-90 transition-all font-medium text-sm md:text-base whitespace-nowrap"
                            style={{
                                borderWidth: 1,
                                borderColor: colors.primary,
                                color: colors.primary,
                                backgroundColor: colors.bgWhite
                            }}
                        >
                            Enable location settings
                        </button>
                    </form>

                    <form className="space-y-4 mt-4" onSubmit={e => model.submit(e)}>
                        <div
                            className="relative flex items-center h-[48px] w-full px-3 rounded-sm"
                            style={{
                                color: colors.textSecondary,
                                backgroundColor: colors.bgWhite,
                                borderWidth: 1,
                                borderColor: colors.borderMedium
                            }}
                        >
                            <CustomerInput<SearchBranchesByAreaParams | FindNearestBranchesParams>
                                id={"searchText"}
                                label={"Search for a branch name, city or province"}
                                value={inputValue}
                                error={state?.errors}
                                inputStyle={"bg-transparent outline-none w-full pr-8 py-2 text-sm"}
                                type="text"
                                onChange={model.onChange}
                            />
                            <Search
                                className="absolute right-3 h-5 w-5"
                                style={{ color: colors.textSecondary }}
                            />
                        </div>
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
                            Nearby Branches
                        </div>

                        {/* Scrollable List Area */}
                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                            {branchesElements}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BranchLocator;

