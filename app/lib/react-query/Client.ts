import { MutationCache, QueryClient } from "@tanstack/react-query";
import type { BranchSearchResponse, NearbyBranchesResponse } from "~/domain/branch-locator/generated/model";
import type { AppointmentsResponse } from "~/domain/appointment/generated/model";

// Session storage keys
const BRANCH_CACHE_KEY = "branch-query-cache";
const APPOINTMENT_CACHE_KEY = "appointment-query-cache";

// Cache configuration for branches (long-lived since it's just metadata)
export const BRANCH_CACHE_CONFIG = {
    staleTime: 30 * 60 * 1000, // 30 minutes - data considered fresh
    gcTime: 60 * 60 * 1000, // 60 minutes - keep in memory
};

// Cache configuration for appointments
// staleTime: Infinity - never auto-refetch, only invalidate on mutations (book/cancel/reschedule)
// gcTime: session duration - keep until logout
export const APPOINTMENT_CACHE_CONFIG = {
    staleTime: Infinity,
    gcTime: 60 * 60 * 1000, // 60 minutes - keep in memory
};

// Global query key for appointments (used for invalidation after mutations)
export const APPOINTMENT_QUERY_KEY = "customerAppointments";

// Branch API URL patterns
const BRANCH_API_PATTERNS = [
    "/api/v1/locations/branches/search",
    "/api/v1/locations/branches/nearby",
];

// Appointment API URL pattern
const APPOINTMENT_API_PATTERN = "/api/v1/appointments/customer/";

/** Branch response type union */
export type BranchCacheData = BranchSearchResponse | NearbyBranchesResponse;

/** Cache entry structure for branches */
interface BranchCacheEntry {
    data: BranchCacheData;
    dataUpdatedAt: number;
}

/** Cache entry structure for appointments */
interface AppointmentCacheEntry {
    data: AppointmentsResponse;
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
 * Check if query key is appointment-related
 */
const isAppointmentQuery = (queryKey: readonly unknown[]): boolean => {
    if (!Array.isArray(queryKey) || queryKey.length === 0) return false;
    const firstKey = queryKey[0];
    if (typeof firstKey !== "string") return false;
    return firstKey.includes(APPOINTMENT_API_PATTERN);
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
 * Persist appointment queries to session storage
 */
const persistAppointmentCache = (queryClient: QueryClient) => {
    const appointmentQueries = queryClient.getQueryCache().findAll({
        predicate: (query) => isAppointmentQuery(query.queryKey),
    });

    const cacheData: Record<string, AppointmentCacheEntry> = {};
    appointmentQueries.forEach((query) => {
        if (query.state.data) {
            const keyString = JSON.stringify(query.queryKey);
            cacheData[keyString] = {
                data: query.state.data as AppointmentsResponse,
                dataUpdatedAt: query.state.dataUpdatedAt,
            };
        }
    });

    try {
        sessionStorage.setItem(APPOINTMENT_CACHE_KEY, JSON.stringify(cacheData));
    } catch (e) {
        console.debug("Failed to persist appointment cache:", e);
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
 * Restore appointment queries from session storage
 */
const restoreAppointmentCache = (queryClient: QueryClient) => {
    try {
        const cached = sessionStorage.getItem(APPOINTMENT_CACHE_KEY);
        if (!cached) return;

        const cacheData = JSON.parse(cached) as Record<string, AppointmentCacheEntry>;
        const now = Date.now();

        Object.entries(cacheData).forEach(([keyString, value]) => {
            // Check if cache is still valid (within gcTime)
            if (now - value.dataUpdatedAt < APPOINTMENT_CACHE_CONFIG.gcTime) {
                const queryKey = JSON.parse(keyString);
                queryClient.setQueryData(queryKey, value.data, {
                    updatedAt: value.dataUpdatedAt,
                });
            }
        });
    } catch (e) {
        console.debug("Failed to restore appointment cache:", e);
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
 * Clear appointment cache from session storage (called on logout)
 */
export const clearAppointmentCache = () => {
    try {
        sessionStorage.removeItem(APPOINTMENT_CACHE_KEY);
    } catch (e) {
        console.debug("Failed to clear appointment cache:", e);
    }
};

/**
 * Clear all caches from session storage (called on logout)
 */
export const clearAllCaches = () => {
    clearBranchCache();
    clearAppointmentCache();
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

/**
 * Get the cached appointment data for a specific user from session storage
 */
export const getCachedAppointmentData = (username: string): { data: AppointmentsResponse; queryKey: string[] } | null => {
    try {
        const cached = sessionStorage.getItem(APPOINTMENT_CACHE_KEY);
        if (!cached) return null;

        const cacheData = JSON.parse(cached) as Record<string, AppointmentCacheEntry>;
        const now = Date.now();

        // Find cache entry matching the username
        for (const [keyString, value] of Object.entries(cacheData)) {
            const queryKey = JSON.parse(keyString) as string[];
            // Check if this is the user's appointment query
            if (queryKey[0]?.includes(`/customer/${username}`)) {
                // Check if cache is still valid (within gcTime)
                if (now - value.dataUpdatedAt < APPOINTMENT_CACHE_CONFIG.gcTime) {
                    return { data: value.data, queryKey };
                }
            }
        }

        return null;
    } catch (e) {
        console.debug("Failed to get cached appointment data:", e);
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

// Restore caches on load
restoreBranchCache(queryClient);
restoreAppointmentCache(queryClient);

// Subscribe to cache changes to persist data
queryClient.getQueryCache().subscribe((event) => {
    if (event.type === "updated" && event.query.state.data) {
        if (isBranchQuery(event.query.queryKey)) {
            persistBranchCache(queryClient);
        } else if (isAppointmentQuery(event.query.queryKey)) {
            persistAppointmentCache(queryClient);
        }
    }
});
