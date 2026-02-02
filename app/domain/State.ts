import type {TypeError} from "~/domain/error/Error";

/**
 * @T model type
 * @R is the expected response model type
 */
export interface State<T,R>{
    userData: T;
    errors:TypeError<T>,
    isLoading:boolean,
    response?:{
        isSuccess: boolean;
        data?:R;
        message?:string,
        status?:number
    }
}