// src/config/env-types.ts

import type {EnvironmentConfig, ProcessEnvVars} from "~/utils/env/env-types";

const parseCustomHeaders = (headerString: string | undefined): Record<string, string> => {
    if (!headerString) return {};

    try {
        const parsed = JSON.parse(headerString);
        if (typeof parsed === 'object' && parsed !== null) {
            return parsed as Record<string, string>;
        }
        return {};
    } catch (error) {
        console.warn('Failed to parse REACT_APP_CUSTOM_HEADERS:', error);
        return {};
    }
};


const env: EnvironmentConfig = {
    API_BASE_URL: import.meta.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:59674',
   // API_TIMEOUT: parseInt(import.meta.env.REACT_APP_API_TIMEOUT || '10000', 10),
    API_RETRIES:parseInt(import.meta.env.REACT_APP_API_RETRIES || '2', 10),
    CUSTOM_HEADERS: parseCustomHeaders(import.meta.env.REACT_APP_CUSTOM_HEADERS)||{},
    API_KEY: import.meta.env.REACT_APP_API_KEY || 'CAPITEC_APPOINTMENT_WEB_CLIENT_APP',
    REALM: import.meta.env.REACT_APP_REALM || "capitec_appointment-DEV"
};

console.log(env);

// Validation with type safety
const validateEnvironment = (config: EnvironmentConfig): void => {
    if (!config.API_BASE_URL) {
        throw new Error('REACT_APP_API_BASE_URL is required');
    }

    // if (isNaN(config.API_TIMEOUT) || config.API_TIMEOUT <= 0) {
    //     throw new Error('REACT_APP_API_TIMEOUT must be a valid positive number');
    // }
};

validateEnvironment(env);

export default env;