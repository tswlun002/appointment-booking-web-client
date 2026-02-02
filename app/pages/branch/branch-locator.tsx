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
    const responseStyle = {color:state.errors?.response?.isError?"var(--color-red-600)":"var(--color-green-600)"};
    const responseMessage =state.errors?.response?.message||""
    const responseElement  =  isResponse&&<Error style={responseStyle} message={responseMessage as string }></Error>
    return (
        <div className="flex flex-col w-full items-start justify-start gap-4">
            <div className={`search-section w-full min-h-[450px] rounded-md  bg-no-repeat flex flex-col items-center md:items-start p-4 md:p-10`}>

                {
                    responseElement
                }
                <div className="bg-white/20 backdrop-blur-xs w-full max-w-[544px] text-left rounded-sm p-6 shadow-lg">
                    <h3 className="text-3xl font-semibold py-4 text-[#3a3a3a]">Find a branch</h3>
                    <form className="space-y-4" onSubmit={e => model.searchByCurrentLocation(e)}>
                        <button
                            type="submit"
                            className="flex items-center justify-center text-center border-[0.8px] border-[#2f70ef] text-[#2f70ef] bg-white rounded-full cursor-pointer min-h-[48px] w-full md:w-auto py-2 px-6 hover:bg-blue-50 transition-all font-medium"
                        >
                            Please enable your location settings
                        </button>
                    </form>
                    <form className="space-y-4" onSubmit={e=>model.submit(e)}>
                        <div className="text-[#3a3a3a] bg-white flex items-center h-[48px] w-full border border-gray-300 px-3 rounded-sm focus-within:ring-2 focus-within:ring-[#2f70ef] focus-within:border-transparent">

                            <CustomerInput<SearchBranchesByAreaParams | FindNearestBranchesParams>
                                id={"searchText"}
                                label={"Search for a branch name, city or province"}
                                value={inputValue}
                                error={state?.errors}
                                inputStyle={"bg-transparent outline-none w-full py-2 text-sm"}
                                type="text"
                                onChange={model.onChange}
                            />
                            <Search className="h-5 w-5 text-[#3a3a3a]" />
                        </div>
                    </form>
                </div>

                {/* 2. Results List Section */}
                {branches && (
                    <div className="operation-hours bg-white/80 backdrop-blur-xs  w-full max-w-[544px] mt-4 rounded-sm shadow-xl flex flex-col overflow-hidden border-b-[0.8px] border-[#3a3a3a2b]">
                        <div className="bg-gray-50 px-6 py-2 border-b text-xs font-bold text-gray-500 uppercase tracking-wider">
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