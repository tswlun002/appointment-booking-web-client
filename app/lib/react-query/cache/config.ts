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

// Default query options
export const DEFAULT_QUERY_CONFIG = {
    staleTime: 5 * 60 * 1000, // 5 minutes default
    gcTime: 10 * 60 * 1000, // 10 minutes default
    refetchOnWindowFocus: false,
};

