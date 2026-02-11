// Cache configuration
export { BRANCH_CACHE_CONFIG, APPOINTMENT_CACHE_CONFIG, DEFAULT_QUERY_CONFIG } from "./config";

// Branch cache
export {
    isBranchQuery,
    persistBranchCache,
    restoreBranchCache,
    clearBranchCache,
    getLastCachedBranchData,
    type BranchCacheData,
} from "./branch-cache";

// Appointment cache
export {
    isAppointmentQuery,
    persistAppointmentCache,
    restoreAppointmentCache,
    clearAppointmentCache,
    getCachedAppointmentData,
} from "./appointment-cache";

import { clearBranchCache } from "./branch-cache";
import { clearAppointmentCache } from "./appointment-cache";

/** Clear all caches (called on logout) */
export const clearAllCaches = (): void => {
    clearBranchCache();
    clearAppointmentCache();
};

