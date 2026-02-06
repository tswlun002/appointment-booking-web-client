import {AxiosError, type AxiosInstance, type AxiosResponse} from "axios";
import {axiosAuthorizedRequest, type BackendError} from "~/lib/axios/default-axios";
import useAuthStore from "~/model/auth/zustand/AuthStore";
import type {TokenResponse} from "~/domain/auth/TokenResponse";
import {isNotBlank, TOKEN_EXPIRED_MESSAGE} from "~/utils/CompanionObjects";
import {v4 as UUID} from 'uuid';
import env from "~/utils/env/env";

enum AxiosErrorType {
    RequestError,
    ResponseError
}

export type ErrorType<Error> = AxiosError<BackendError>;

export class ApiClient {
    private isRefreshing = false;
    private refreshPromise: Promise<any> | null = null;
    private xRetryCount = "X-Retry-Count";
    private xAuthorization = "Authorization";

    constructor() {

        this.setupRequestInterceptors()
        this.setupResponseInterceptors()
    }

    private setupRequestInterceptors() {


         return this.getInstance().interceptors.request.use(
            (config) => {
                const accessToken = useAuthStore.getState().token;
                const headers = config.headers;

                if(headers && isNotBlank<string>(accessToken?.accessToken)) {

                    headers[this.xAuthorization] = `Bearer ${accessToken?.accessToken}`;

                }
                if(headers["Trace-Id"]===undefined) headers["Trace-Id"] = UUID();
                if(headers[this.xRetryCount]===undefined) {
                    headers[this.xRetryCount] = 0;
                }
                return config;
            },
             (error)=> this.mapError(error,AxiosErrorType.RequestError)
        );
    }

    private setupResponseInterceptors() {
       return  this.getInstance().interceptors.response.use(
            (response: AxiosResponse) => response,
            (error) =>{

                console.debug("error message:",error.message,"\n stack: ",JSON.stringify(error));

                if(error.code === AxiosError.ERR_NETWORK){
                    error.message = "Our service is down at the moment, please try again later";
                    error.status = 500;
                    const normalizedError = this.normalizeError(error);
                    return Promise.reject(normalizedError);
                }
                else if(error.code === AxiosError.ETIMEDOUT){
                    error.message = "Check network connection and try again later";
                    error.status = 500;
                    const normalizedError = this.normalizeError(error);
                    return Promise.reject(normalizedError);
                }
                return this.mapError(error, AxiosErrorType.ResponseError)
            }
        );
    }

    private async mapError(error: ErrorType<BackendError>, errorType: AxiosErrorType): Promise<AxiosErrorType>{

        switch(errorType) {

            case AxiosErrorType.RequestError:{
                const normalizedError = this.normalizeError(error);
                return Promise.reject(normalizedError);
            }
            case AxiosErrorType.ResponseError:{
                 const originalRequest = error?.config;
                // logout when refresh token request error is bad request, forbidden, unauthorized, token expired, refresh token expired
                const statusCode = error.status ?? error.response?.status ?? 0;
                if(statusCode <500 && statusCode>=400 && originalRequest?.url?.endsWith("/auth/refresh")){
                    await useAuthStore.getState().logout();
                    const normalizedError = this.normalizeError(error);
                    return Promise.reject(normalizedError);

                }
                if(error.response?.status===401 || error.response?.data?.message===TOKEN_EXPIRED_MESSAGE) {
                    if (originalRequest?.headers[this.xRetryCount] <= env.API_RETRIES) {
                        try {
                            // Call refresh directly
                            const newToken = await this.refreshAccessToken();

                            // Update store
                            await useAuthStore.getState().refreshToken(newToken);

                            // Retry original request with new token
                            if (originalRequest?.headers) {
                                originalRequest.headers[this.xAuthorization] = `Bearer ${newToken.access_token}`;
                                originalRequest.headers[this.xRetryCount] = parseInt(originalRequest.headers[this.xRetryCount]) + 1;

                            }

                            return this.getInstance()(originalRequest!);
                        } catch (refreshError) {
                            // Refresh failed, logout user
                            await useAuthStore.getState().logout();
                            const normalizedError = this.normalizeError(error);
                            return Promise.reject(normalizedError);
                        }

                    }
                    else{
                        await useAuthStore.getState().logout();
                        const normalizedError = this.normalizeError(error, true);
                        return Promise.reject(normalizedError);
                    }
                }
                else if(originalRequest !==undefined  &&(error.response?.status===502 || error.response?.status===503 )) {
                    if( parseInt(originalRequest?.headers[this.xRetryCount])<=env.API_RETRIES) {

                        const retryCount = parseInt(originalRequest.headers[this.xRetryCount]);
                        const backoffDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s...
                        await this.delay(backoffDelay);
                        originalRequest.headers[this.xRetryCount] = parseInt(originalRequest.headers[this.xRetryCount]) + 1;

                        return this.getInstance()(originalRequest!);
                    }else {
                        const normalizedError = this.normalizeError(error, true);
                        return Promise.reject(normalizedError);
                    }

                }

                const normalizedError = this.normalizeError(error);
                return Promise.reject(normalizedError);
            }
        }

    }
    private async refreshAccessToken(): Promise<TokenResponse> {
        // Prevent multiple simultaneous refresh calls
        if (this.isRefreshing && this.refreshPromise) {
            return this.refreshPromise;
        }

        this.isRefreshing = true;

        this.refreshPromise = (async () => {
            try {
                // Call refresh API directly (no React Query)
                const response = await this.getInstance()
                    .post<TokenResponse>("/api/v1/auth/refresh");

                return response.data;
            } finally {
                this.isRefreshing = false;
                this.refreshPromise = null;
            }
        })();

        return this.refreshPromise;
    }
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private normalizeError(error: ErrorType<BackendError>, retriesExhausted: boolean = false): BackendError {
        const responseData = error.response?.data;
        const traceId = error.config?.headers?.["Trace-Id"] as string | undefined;

        return {
            message: responseData?.message || error.message || 'System Error',
            statusCodeMessage: responseData?.statusCodeMessage || error.code || 'UNKNOWN_ERROR',
            status: error.response?.status || error.status || 500,
            path: responseData?.path || error.config?.url || '',
            timestamp: responseData?.timestamp || new Date().toISOString(),
            traceId: traceId,
            retriesExhausted: retriesExhausted
        };
    }

    public getInstance(): AxiosInstance {
        return axiosAuthorizedRequest;
    }


}
