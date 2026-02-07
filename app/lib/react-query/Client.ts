import { MutationCache, QueryClient } from "@tanstack/react-query";
import type { BranchSearchResponse, NearbyBranchesResponse } from "~/domain/branch-locator/generated/model";

// Session storage key for branch cache
const BRANCH_CACHE_KEY = "branch-query-cache";

// Cache configuration for branches (long-lived since it's just metadata)
export const BRANCH_CACHE_CONFIG = {
    staleTime: 30 * 60 * 1000, // 30 minutes - data considered fresh
    gcTime: 60 * 60 * 1000, // 60 minutes - keep in memory
};

// Branch API URL patterns
const BRANCH_API_PATTERNS = [
    "/api/v1/locations/branches/search",
    "/api/v1/locations/branches/nearby",
];

/** Branch response type union */
export type BranchCacheData = BranchSearchResponse | NearbyBranchesResponse;

/** Cache entry structure */
interface BranchCacheEntry {
    data: BranchCacheData;
    dataUpdatedAt: number;
}

/**
 * Check if query key is branch-related
 */
const isBranchQuery = (queryKey: readonly unknown[]): boolean => {
    if (!Array.isArray(queryKey) || queryKey.length === 0) return false;
    const firstKey = queryKey[0];
    if (typeof firstKey !== "string") return false;
    return BRANCH_API_PATTERNS.some(pattern => firstKey.includes(pattern));
};

/**
 * Persist branch queries to session storage
 */
const persistBranchCache = (queryClient: QueryClient) => {
    const branchQueries = queryClient.getQueryCache().findAll({
        predicate: (query) => isBranchQuery(query.queryKey),
    });

    const cacheData: Record<string, BranchCacheEntry> = {};
    branchQueries.forEach((query) => {
        if (query.state.data) {
            const keyString = JSON.stringify(query.queryKey);
            cacheData[keyString] = {
                data: query.state.data as BranchCacheData,
                dataUpdatedAt: query.state.dataUpdatedAt,
            };
        }
    });

    try {
        sessionStorage.setItem(BRANCH_CACHE_KEY, JSON.stringify(cacheData));
    } catch (e) {
        console.debug("Failed to persist branch cache:", e);
    }
};

/**
 * Restore branch queries from session storage
 */
const restoreBranchCache = (queryClient: QueryClient) => {
    try {
        const cached = sessionStorage.getItem(BRANCH_CACHE_KEY);
        if (!cached) return;

        const cacheData = JSON.parse(cached) as Record<string, BranchCacheEntry>;
        const now = Date.now();

        Object.entries(cacheData).forEach(([keyString, value]) => {
            // Check if cache is still valid (within gcTime)
            if (now - value.dataUpdatedAt < BRANCH_CACHE_CONFIG.gcTime) {
                const queryKey = JSON.parse(keyString);
                queryClient.setQueryData(queryKey, value.data, {
                    updatedAt: value.dataUpdatedAt,
                });
            }
        });
    } catch (e) {
        console.debug("Failed to restore branch cache:", e);
    }
};

/**
 * Clear branch cache from session storage (called on logout)
 */
export const clearBranchCache = () => {
    try {
        sessionStorage.removeItem(BRANCH_CACHE_KEY);
    } catch (e) {
        console.debug("Failed to clear branch cache:", e);
    }
};

/**
 * Get the most recent cached branch data from session storage
 * Returns the data with the most recent dataUpdatedAt timestamp
 */
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
            // Check if cache is still valid (within gcTime)
            if (now - value.dataUpdatedAt < BRANCH_CACHE_CONFIG.gcTime) {
                if (value.dataUpdatedAt > mostRecentTime) {
                    mostRecentData = value.data;
                    mostRecentKey = JSON.parse(keyString) as string[];
                    mostRecentTime = value.dataUpdatedAt;
                }
            }
        });

        return mostRecentData && mostRecentKey
            ? { data: mostRecentData, queryKey: mostRecentKey }
            : null;
    } catch (e) {
        console.debug("Failed to get cached branch data:", e);
        return null;
    }
};

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes default
            gcTime: 10 * 60 * 1000, // 10 minutes default
            refetchOnWindowFocus: false,
        },
    },
    mutationCache: new MutationCache({
        onError: (_error, _variables, _context, mutation) => {
            const invalidateQueries = mutation.meta?.invalidateOnError;
            if (invalidateQueries) {
                queryClient.invalidateQueries(invalidateQueries);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["userLogin"] });
        },
    }),
});

// Restore cache on load
restoreBranchCache(queryClient);

// Subscribe to cache changes to persist branch data
queryClient.getQueryCache().subscribe((event) => {
    if (event.type === "updated" && event.query.state.data) {
        if (isBranchQuery(event.query.queryKey)) {
            persistBranchCache(queryClient);
        }
    }
});
