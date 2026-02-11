import type { QueryClient } from "@tanstack/react-query";
import type { AppointmentsResponse } from "~/domain/appointment/generated/model";
import { APPOINTMENT_CACHE_CONFIG } from "./config";

const APPOINTMENT_CACHE_KEY = "appointment-query-cache";
const APPOINTMENT_API_PATTERN = "/api/v1/appointments/customer/";

interface AppointmentCacheEntry {
    data: AppointmentsResponse;
    dataUpdatedAt: number;
}

export const isAppointmentQuery = (queryKey: readonly unknown[]): boolean => {
    if (!Array.isArray(queryKey) || queryKey.length === 0) return false;
    const firstKey = queryKey[0];
    if (typeof firstKey !== "string") return false;
    return firstKey.includes(APPOINTMENT_API_PATTERN);
};

export const persistAppointmentCache = (queryClient: QueryClient): void => {
    const appointmentQueries = queryClient.getQueryCache().findAll({
        predicate: (query) => isAppointmentQuery(query.queryKey),
    });
    const cacheData: Record<string, AppointmentCacheEntry> = {};
    appointmentQueries.forEach((query) => {
        if (query.state.data) {
            cacheData[JSON.stringify(query.queryKey)] = {
                data: query.state.data as AppointmentsResponse,
                dataUpdatedAt: query.state.dataUpdatedAt,
            };
        }
    });
    try { sessionStorage.setItem(APPOINTMENT_CACHE_KEY, JSON.stringify(cacheData)); }
    catch (e) { console.debug("Failed to persist appointment cache:", e); }
};

export const restoreAppointmentCache = (queryClient: QueryClient): void => {
    try {
        const cached = sessionStorage.getItem(APPOINTMENT_CACHE_KEY);
        if (!cached) return;
        const cacheData = JSON.parse(cached) as Record<string, AppointmentCacheEntry>;
        const now = Date.now();
        Object.entries(cacheData).forEach(([keyString, value]) => {
            if (now - value.dataUpdatedAt < APPOINTMENT_CACHE_CONFIG.gcTime) {
                queryClient.setQueryData(JSON.parse(keyString), value.data, { updatedAt: value.dataUpdatedAt });
            }
        });
    } catch (e) { console.debug("Failed to restore appointment cache:", e); }
};

export const clearAppointmentCache = (): void => {
    try { sessionStorage.removeItem(APPOINTMENT_CACHE_KEY); }
    catch (e) { console.debug("Failed to clear appointment cache:", e); }
};

export const getCachedAppointmentData = (username: string): { data: AppointmentsResponse; queryKey: string[] } | null => {
    try {
        const cached = sessionStorage.getItem(APPOINTMENT_CACHE_KEY);
        if (!cached) return null;
        const cacheData = JSON.parse(cached) as Record<string, AppointmentCacheEntry>;
        const now = Date.now();
        for (const [keyString, value] of Object.entries(cacheData)) {
            const queryKey = JSON.parse(keyString) as string[];
            if (queryKey[0]?.includes(`/customer/${username}`)) {
                if (now - value.dataUpdatedAt < APPOINTMENT_CACHE_CONFIG.gcTime) {
                    return { data: value.data, queryKey };
                }
            }
        }
        return null;
    } catch (e) { console.debug("Failed to get cached appointment data:", e); return null; }
};

