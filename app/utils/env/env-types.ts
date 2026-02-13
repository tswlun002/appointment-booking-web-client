import  {z} from "zod";

const EnvironmentConfigSchema = z.strictObject({
    API_BASE_URL:z.string(),
     API_TIMEOUT:z.int(),
    API_RETRIES: z.int(),
    CUSTOM_HEADERS: z.record(z.string(),z.string()),
    REALM:z.string(),
    INTERNAL_BASE_URL:z.string(),

});



export type EnvironmentConfig = z.infer<typeof  EnvironmentConfigSchema>;

export interface ProcessEnvVars {
    REACT_APP_API_BASE_URL?: string;
    REACT_APP_API_TIMEOUT?: string;
    REACT_APP_API_RETRIES?: string;
    REACT_APP_CUSTOM_HEADERS?: string;
    REACT_APP_REALM?: string;

}

export interface AxiosHeaders {
    'Content-Type': string;
    'X-API-Key'?: string;
    'Authorization'?: string;
    [key: string]: string | undefined;

}