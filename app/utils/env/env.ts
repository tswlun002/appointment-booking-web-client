// src/config/env.ts
// Supports both build-time (Vite) and runtime (Node.js server) environment variables

import type { EnvironmentConfig } from "~/utils/env/env-types";

const parseCustomHeaders = (headerString: string | undefined): Record<string, string> => {
    if (!headerString) return {};

    try {
        const parsed = JSON.parse(headerString);
        if (typeof parsed === 'object' && parsed !== null) {
            return parsed as Record<string, string>;
        }
        return {};
    } catch (error) {
        console.warn('Failed to parse CUSTOM_HEADERS:', error);
        return {};
    }
};

/**
 * Get environment variable from either:
 * 1. Runtime (process.env) - for SSR/server
 * 2. Build-time (import.meta.env) - for client
 */
const getEnvVar = (key: string, defaultValue: string = ''): string => {
    // Server-side: use process.env (runtime)
    if (typeof process !== 'undefined' && process.env?.[key]) {
        return process.env[key] as string;
    }
    // Client-side: use import.meta.env (build-time)
    const viteKey = `VITE_${key}`;
    if (import.meta.env?.[viteKey]) {
        return import.meta.env[viteKey] as string;
    }
    return defaultValue;
};

const env: EnvironmentConfig = {
    API_BASE_URL: getEnvVar('API_BASE_URL', 'http://localhost:57943'),
    API_RETRIES: parseInt(getEnvVar('API_RETRIES', '2'), 10),
    CUSTOM_HEADERS: parseCustomHeaders(getEnvVar('CUSTOM_HEADERS')),
    API_KEY: getEnvVar('API_KEY', 'CAPITEC_APPOINTMENT_WEB_CLIENT_APP'),
    REALM: getEnvVar('REALM', 'capitec_appointment-DEV')
};

// Validation with type safety
const validateEnvironment = (config: EnvironmentConfig): void => {
    if (!config.API_BASE_URL) {
        throw new Error('API_BASE_URL is required');
    }
};

validateEnvironment(env);

export default env;