import type { EnvironmentConfig } from "~/utils/env/env-types";

declare global {
    interface Window {
        ENV?: {
            INTERNAL_BASE_URL: string;
            API_BASE_URL: string;
            API_RETRIES: string;
            API_KEY: string;
            REALM: string;
            [key: string]: string | undefined;
        };
    }
}

const parseCustomHeaders = (headerString: string | undefined): Record<string, string> => {
    if (!headerString) return {};

    try {
        // if place holder
        if(!(headerString.startsWith("{") && headerString.endsWith("}"))) {
            return {}
        }
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
export const getEnvVar = (key: string, defaultValue: string = ''): string => {
    // For SSR, always read from process.env at runtime
    console.log("Custom headers getEnvVar: ", key, defaultValue);
    if (typeof process !== 'undefined' && process.env) {
        // Read with or without VITE_ prefix
        const value = process.env[key] || process.env[`VITE_${key}`];
        if (value) return value;
    }
    // Client-side: use import.meta.env (build-time)

    if (typeof window !== 'undefined' && window.ENV?.[key]) {
        return window.ENV[key];
    }
    const viteKey = `VITE_${key}`;
    if (import.meta.env?.[viteKey]) {
        return import.meta.env[viteKey] as string;
    }
    return defaultValue;
};

const env: EnvironmentConfig = {
    INTERNAL_BASE_URL: getEnvVar('INTERNAL_BASE_URL'),
    API_BASE_URL: getEnvVar('API_BASE_URL'),
    API_RETRIES: parseInt(getEnvVar('API_RETRIES', '0'), 10),
    CUSTOM_HEADERS: parseCustomHeaders(getEnvVar('CUSTOM_HEADERS','{}')),
    API_TIMEOUT: parseInt(getEnvVar('API_TIMEOUT','5'),10) *1000,
    REALM: getEnvVar('REALM')
};

// Validation with type safety
const validateEnvironment = (config: EnvironmentConfig): void => {
    if (!config.API_BASE_URL) {
        throw new Error('API_BASE_URL is required');
    }
    if (!config.INTERNAL_BASE_URL) {
        throw new Error('INTERNAL_BASE_URL is required');
    }
};
console.log("Env server: ",env)
validateEnvironment(env);

export default env;