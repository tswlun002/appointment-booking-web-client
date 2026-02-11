import { MutationCache, QueryClient } from "@tanstack/react-query";
import {
    DEFAULT_QUERY_CONFIG,
    isBranchQuery,
    persistBranchCache,
    restoreBranchCache,
    isAppointmentQuery,
    persistAppointmentCache,
    restoreAppointmentCache,
} from "./cache";

// Re-export cache utilities for external use
export {
    BRANCH_CACHE_CONFIG,
    APPOINTMENT_CACHE_CONFIG,
    clearBranchCache,
    clearAppointmentCache,
    clearAllCaches,
    getLastCachedBranchData,
    getCachedAppointmentData,
    type BranchCacheData,
} from "./cache";

// Global query key for appointments (used for invalidation after mutations)
export const APPOINTMENT_QUERY_KEY = "customerAppointments";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: DEFAULT_QUERY_CONFIG,
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
