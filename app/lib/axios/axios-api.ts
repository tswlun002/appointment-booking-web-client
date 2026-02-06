import {AxiosError, type AxiosInstance, type AxiosResponse} from "axios";
import {axiosAuthorizedRequest, type BackendError} from "~/lib/axios/default-axios";
import useAuthStore from "~/model/auth/zustand/AuthStore";
import type {TokenResponse} from "~/domain/auth/TokenResponse";
import {isNotBlank, TOKEN_EXPIRED_MESSAGE} from "~/utils/CompanionObjects";
enum AxiosErrorType {
    RequestError,
    ResponseError
}

export type ErrorType<Error> = AxiosError<BackendError>;

export class ApiClient {
    private isRefreshing = false;
    private refreshPromise: Promise<any> | null = null;
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

                    headers['Authorization'] = `Bearer ${accessToken?.accessToken}`;

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
                   return  Promise.reject(error);
                }
                else if(error.code === AxiosError.ETIMEDOUT){
                    error.message = "Check network connection and try again later";
                    error.status = 500;
                    return Promise.reject(error);

                }
                const data = error.response?.data as BackendError;

            if (data) {
                    error.message = data.message || data.statusCodeMessage || error.message;
             }
            return     this.mapError(error, AxiosErrorType.ResponseError)
            }
        );
    }

    private async mapError(error: ErrorType<BackendError>, errorType: AxiosErrorType): Promise<AxiosErrorType>{

        const message = error.response?.data;
        const reason = {
            message: message?.message|| error.message||message?.statusCodeMessage || 'System Error',
            status: error.response?.status || 500,
        };
        error.message =reason.message;
        error.status = reason.status;

        switch(errorType) {

            case AxiosErrorType.RequestError:{

                return Promise.reject(error);
            }
            case AxiosErrorType.ResponseError:{
                 const originalRequest = error?.config;
                // logout on error
                if(error.status <500 && error.status>=400 && originalRequest?.url?.endsWith("/auth/refresh")){
                    await useAuthStore.getState().logout();
                    return Promise.reject(error);

                }
                if(error.response?.status===401 || error.response?.data?.message===TOKEN_EXPIRED_MESSAGE){

                    try {
                        // Call refresh directly
                        const newToken = await this.refreshAccessToken();


                         // Update store
                         await useAuthStore.getState().refreshToken(newToken);

                        // Retry original request with new token
                        if (originalRequest?.headers) {
                            originalRequest.headers['Authorization'] = `Bearer ${newToken.access_token}`;
                        }

                        return this.getInstance()(originalRequest!);
                    } catch (refreshError) {
                        // Refresh failed, logout user
                        await useAuthStore.getState().logout();

                        return Promise.reject(refreshError);
                    }

                }
                return Promise.reject(reason);
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
    private async mapRefreshApiError(error: any, errorType: AxiosErrorType): Promise<Error> {
        const reason = {
            message: error.response?.data?.message || 'System Error',
            status: error.response?.status || 500,
            field: error.response?.data?.field,
        };

        return Promise.reject(reason);
    }

    public getInstance(): AxiosInstance {
        return axiosAuthorizedRequest;
    }


}
