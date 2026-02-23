import type { QueryClient } from "@tanstack/react-query";
import type { BranchSearchResponse, NearbyBranchesResponse } from "~/domain/branch-locator/generated/model";
import { BRANCH_CACHE_CONFIG } from "./config";

const BRANCH_CACHE_KEY = "branch-query-cache";
const BRANCH_API_PATTERNS = ["/api/v1/locations/branches/search", "/api/v1/locations/branches/nearby"];

export type BranchCacheData = BranchSearchResponse | NearbyBranchesResponse;

interface BranchCacheEntry {
    data: BranchCacheData;
    dataUpdatedAt: number;
}

export const isBranchQuery = (queryKey: readonly unknown[]): boolean => {
    if (!Array.isArray(queryKey) || queryKey.length === 0) return false;
    const firstKey = queryKey[0];
    if (typeof firstKey !== "string") return false;
    return BRANCH_API_PATTERNS.some(pattern => firstKey.includes(pattern));
};

export const persistBranchCache = (queryClient: QueryClient): void => {
    const branchQueries = queryClient.getQueryCache().findAll({
        predicate: (query) => isBranchQuery(query.queryKey),
    });
    const cacheData: Record<string, BranchCacheEntry> = {};
    branchQueries.forEach((query) => {
        if (query.state.data) {
            cacheData[JSON.stringify(query.queryKey)] = {
                data: query.state.data as BranchCacheData,
                dataUpdatedAt: query.state.dataUpdatedAt,
            };
        }
    });
    try { sessionStorage.setItem(BRANCH_CACHE_KEY, JSON.stringify(cacheData)); }
    catch { /* Cache persistence failed silently */ }
};

export const restoreBranchCache = (queryClient: QueryClient): void => {
    try {
        const cached = sessionStorage.getItem(BRANCH_CACHE_KEY);
        if (!cached) return;
        const cacheData = JSON.parse(cached) as Record<string, BranchCacheEntry>;
        const now = Date.now();
        Object.entries(cacheData).forEach(([keyString, value]) => {
            if (now - value.dataUpdatedAt < BRANCH_CACHE_CONFIG.gcTime) {
                queryClient.setQueryData(JSON.parse(keyString), value.data, { updatedAt: value.dataUpdatedAt });
            }
        });
    } catch { /* Cache restore failed silently */ }
};

export const clearBranchCache = (): void => {
    try { sessionStorage.removeItem(BRANCH_CACHE_KEY); }
    catch { /* Cache clear failed silently */ }
};

export const getLastCachedBranchData = (): { data: BranchCacheData; queryKey: string[] } | null => {
    try {
        const cached = sessionStorage.getItem(BRANCH_CACHE_KEY);
        if (!cached) return null;
        const cacheData = JSON.parse(cached) as Record<string, BranchCacheEntry>;
        const now = Date.now();
        let mostRecentData: BranchCacheData | null = null;
        let mostRecentKey: string[] | null = null;
        let mostRecentTime = 0;
        Object.entries(cacheData).forEach(([keyString, value]) => {
            if (now - value.dataUpdatedAt < BRANCH_CACHE_CONFIG.gcTime && value.dataUpdatedAt > mostRecentTime) {
                mostRecentData = value.data;
                mostRecentKey = JSON.parse(keyString) as string[];
                mostRecentTime = value.dataUpdatedAt;
            }
        });
        return mostRecentData && mostRecentKey ? { data: mostRecentData, queryKey: mostRecentKey } : null;
    } catch { return null; }
};
