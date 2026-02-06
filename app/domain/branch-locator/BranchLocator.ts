import {
    findNearestBranchesQueryLatitudeMax,
    findNearestBranchesQueryLatitudeMin, findNearestBranchesQueryLimitDefault,
    findNearestBranchesQueryLimitMax, findNearestBranchesQueryLongitudeMax, findNearestBranchesQueryLongitudeMin,
    findNearestBranchesQueryMaxDistanceKmMax,
    findNearestBranchesQueryParams,
    searchBranchesByAreaQueryParams, searchBranchesByAreaQuerySearchTextMax,
    searchBranchesByAreaQuerySearchTextMin
} from "~/domain/branch-locator/generated/zod";
import {z} from "zod";
import type {State} from "~/domain/State";
import type {
    BranchSearchResponse,
    FindNearestBranchesParams,
    NearbyBranchesResponse,
    SearchBranchesByAreaParams
} from "~/domain/branch-locator/generated/model";
import type {TypeError} from "~/domain/error/Error";

const searchBranchesByAreaQueryParamSchema = searchBranchesByAreaQueryParams.extend(({
    searchText:z
        .string({ error: "search text is required" })
        .min(searchBranchesByAreaQuerySearchTextMin,`search text must be ${searchBranchesByAreaQuerySearchTextMin} chars at least`)
        .max(searchBranchesByAreaQuerySearchTextMax,`search text must at ${searchBranchesByAreaQuerySearchTextMax} chars at maximum`)

}));
const findNearestBranchesQueryParamsSchema = findNearestBranchesQueryParams.extend(({
    latitude: z
        .number()
        .min(findNearestBranchesQueryLatitudeMin)
        .max(findNearestBranchesQueryLatitudeMax),
    longitude: z
        .number()
        .min(findNearestBranchesQueryLongitudeMin)
        .max(findNearestBranchesQueryLongitudeMax),
    limit: z
        .number()
        .min(1)
        .max(findNearestBranchesQueryLimitMax)
        .default(findNearestBranchesQueryLimitDefault),
    maxDistanceKm: z
        .number()
        .min(1)
        .max(findNearestBranchesQueryMaxDistanceKmMax)
        .optional(),
}));

export const BranchItemSchema = z.strictObject({
    branchId:z.string({error:"BranchId of the select branch is require"}).min(1,"BranchId of the select branch is require")
});
export  const BranchLocatorSchema= searchBranchesByAreaQueryParamSchema || findNearestBranchesQueryParamsSchema;
export  interface  BranchLocatorState extends State<SearchBranchesByAreaParams|FindNearestBranchesParams, NearbyBranchesResponse|BranchSearchResponse>{
    searchType: "area"|"latLong",
    errors: TypeError<SearchBranchesByAreaParams|FindNearestBranchesParams>,
    DISTANCES: number[];
}

export type BranchItem ={
    branchId:string,
    viewedBranch:string,
    viewStatus:boolean,
}

export interface  BranchItemState extends State<BranchItem,string>{

}