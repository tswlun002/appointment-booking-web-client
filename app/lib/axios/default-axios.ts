import env from "~/utils/env/env";
import type {AxiosHeaders} from "~/utils/env/env-types";
import axios, {type AxiosInstance, type AxiosRequestConfig} from "axios";
import {ApiClient} from "~/lib/axios/axios-api";
const createJSONHeaders = (): AxiosHeaders => {
    const baseHeaders: AxiosHeaders = {
        'Content-Type': 'application/json; charset=UTF-8',
    };
    return {
        ...baseHeaders,
        ...env.CUSTOM_HEADERS,
    };
};

const axiosJSONConfig: AxiosRequestConfig = {
    baseURL: env.API_BASE_URL,
    timeout: env.API_TIMEOUT,
    headers: createJSONHeaders(),
    withCredentials: true,

};

export interface BackendError {
    statusCodeMessage: string;
    message: string;
    path: string;
    timestamp: string;
    status: number;
    traceId?: string;
    retriesExhausted?: boolean;
}

//For api that consumer other Content-Type
const axiosConfig: AxiosRequestConfig = {
    baseURL: env.API_BASE_URL,
    timeout: env.API_TIMEOUT,
    headers: env.CUSTOM_HEADERS,
    withCredentials: true,
};

export const axiosAuthorizedRequest: AxiosInstance = axios.create(axiosJSONConfig);
const apiClient = new ApiClient();
const axiosForPrivateApi = apiClient.getInstance();

export const axiosInstanceWrapper = <T>(
    config: AxiosRequestConfig,
    options?: AxiosRequestConfig,
): Promise<T> => {
    // We pass the config from Orval into our instance
    return axiosForPrivateApi({
        ...config,
        ...options,
    }).then(({ data }) => data) // Orval expects the raw data returned
        .catch((error:BackendError) => {
            return Promise.reject(error);
        });
};
