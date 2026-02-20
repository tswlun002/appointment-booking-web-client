import {
    findNearestBranchesQueryLatitudeMax,
    findNearestBranchesQueryLatitudeMin, findNearestBranchesQueryLimitDefaultOne,
    findNearestBranchesQueryLimitMaxOne, findNearestBranchesQueryLongitudeMax, findNearestBranchesQueryLongitudeMin,
    findNearestBranchesQueryMaxDistanceKmMax,
    findNearestBranchesQueryParams,
    searchBranchesByAreaQueryParams, searchBranchesByAreaQuerySearchTextMax,
    searchBranchesByAreaQuerySearchTextMin
} from "~/domain/branch-locator/generated/zod";
import {z} from "zod";
import type {PaginatedState, State} from "~/domain/State";
import type {
    BranchLocation,
    BranchSearchResponse,
    FindNearestBranchesParams,
    NearbyBranchesResponse,
    SearchBranchesByAreaParams
} from "~/domain/branch-locator/generated/model";
import type {TypeError} from "~/domain/error/Error";

/** Default pagination limit for branches */
export const DEFAULT_BRANCH_PAGE_LIMIT = 10;

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
        .max(findNearestBranchesQueryLimitMaxOne)
        .default(findNearestBranchesQueryLimitDefaultOne),
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

/** Combined branch params with pagination */
export type BranchParams = (SearchBranchesByAreaParams | FindNearestBranchesParams) & {
    offset: number;
    limit: number;
};

/** Combined branch response */
export type BranchResponse = NearbyBranchesResponse | BranchSearchResponse;

/** Paginated state for branch locator */
export interface BranchLocatorState extends PaginatedState<BranchParams, BranchResponse, BranchLocation> {
    searchType: "area" | "latLong";
    errors: TypeError<BranchParams>;
    DISTANCES: number[];
}

export type BranchItem ={
    branchId:string,
    viewedBranch:string,
    viewStatus:boolean,
}

export interface  BranchItemState extends State<BranchItem,string>{

}