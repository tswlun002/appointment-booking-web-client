import env from "~/utils/env/env";
import type {AxiosHeaders} from "~/utils/env/env-types";
import axios, {type AxiosInstance, type AxiosRequestConfig} from "axios";

const createJSONHeaders = (): AxiosHeaders => {
    const baseHeaders: AxiosHeaders = {
        'Content-Type': 'application/json; charset=UTF-8',
    };
    // Merge custom headers
    return {
        ...baseHeaders,
        ...env.CUSTOM_HEADERS,
        'X-API-Key': env.API_KEY
    };
};
//For api that consumer JSON content type
const axiosJSONConfig: AxiosRequestConfig = {
    baseURL: env.API_BASE_URL,
 //   timeout: env.API_TIMEOUT,
    headers: createJSONHeaders(),
    withCredentials: true,

};

//For api that consumer other Content-Type
const axiosConfig: AxiosRequestConfig = {
    baseURL: env.API_BASE_URL,
    //timeout: env.API_TIMEOUT,
    headers: env.CUSTOM_HEADERS,
    withCredentials: true,
};

export const axiosJSONContentDefaultInstance: AxiosInstance = axios.create(axiosJSONConfig);
export const axiosDefaultInstance: AxiosInstance = axios.create(axiosConfig);

export const axiosJSONContentDefaultInstanceWrapper = <T>(
    config: AxiosRequestConfig,
    options?: AxiosRequestConfig,
): Promise<T> => {
    // We pass the config from Orval into our instance
    return axiosJSONContentDefaultInstance({
        ...config,
        ...options,
    }).then(({ data }) => data); // Orval expects the raw data returned
};
