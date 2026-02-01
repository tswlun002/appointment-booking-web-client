import {AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse} from "axios";
import {axiosJSONContentDefaultInstance, type BackendError} from "~/lib/axios/default-axios";
import useAuthStore from "~/model/auth/zustand/AuthStore";
import type {TokenResponse} from "~/domain/auth/TokenResponse";
import {isNotBlank, TOKEN_EXPIRED_MESSAGE} from "~/utils/CompanionObjects";
enum AxiosErrorType {
    RequestError,
    ResponseError
}

export type ErrorType<Error> = AxiosError<BackendError>;

class ApiClient {
    private isRefreshing = false;
    private refreshPromise: Promise<any> | null = null;
    constructor() {

        this.setupRequestInterceptors()
        this.setupResponseInterceptors()
    }

    private setupRequestInterceptors() {


         return axiosJSONContentDefaultInstance.interceptors.request.use(
            (config) => {

                const accessToken = useAuthStore.getState().token;
                const headers = config.headers;
                if(headers && isNotBlank<string>(accessToken?.accessToken)) {

                    headers['Authorization'] = `Bearer ${accessToken?.accessToken}`;

                }

                return config;
            },
             (error:ErrorType<BackendError>)=> this.mapError(error,AxiosErrorType.RequestError)
        );
    }

    private setupResponseInterceptors() {
       return  axiosJSONContentDefaultInstance.interceptors.response.use(
            (response: AxiosResponse) => response,
            (error:ErrorType<BackendError>) => this.mapError(error, AxiosErrorType.ResponseError)
        );
    }

    private async mapError(error: ErrorType<BackendError>, errorType: AxiosErrorType): Promise<AxiosErrorType>{

        console.info(error);
        const reason = {
            message: error.response?.data?.message ||error.response?.data.statusCodeMessage|| 'System Error',
            status: error.response?.status || 500,
        };
        error.message =reason.message;
        error.status = reason.status;

        switch(errorType) {

            case AxiosErrorType.RequestError:{

                return Promise.reject(reason);
            }
            case AxiosErrorType.ResponseError:{

                 const originalRequest = error?.config;
                if(error.response?.status===403 && error.response?.data?.message===TOKEN_EXPIRED_MESSAGE){

                    try {
                        // Call refresh directly
                        const newToken = await this.refreshAccessToken();

                        // Update store
                         await useAuthStore.getState().refreshToken(newToken);

                        // Retry original request with new token
                        if (originalRequest?.headers) {
                            originalRequest.headers['Authorization'] = `Bearer ${newToken.access_token}`;
                        }

                        return axiosJSONContentDefaultInstance(originalRequest!);
                    } catch (refreshError) {
                        // Refresh failed, logout user
                        await useAuthStore.getState().logout();
                        window.location.href = '/login';
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
                const response = await axiosJSONContentDefaultInstance
                    .post<TokenResponse>("/auth-service/auth/refresh/token");

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
        return axiosJSONContentDefaultInstance;
    }


}


const apiClient = new ApiClient();
const axiosForPrivateApi = apiClient.getInstance();

export default axiosForPrivateApi;