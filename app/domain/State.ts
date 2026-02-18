import type {TypeError} from "~/domain/error/Error";

/**
 * Pagination metadata for paginated responses
 */
export interface PaginationMeta {
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    isFirstPage: boolean;
    isLastPage: boolean;
}

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

/**
 * Extended state for paginated data
 * @T model type (must include offset and limit)
 * @R is the expected response model type
 * @I is the item type in the paginated list
 */
export interface PaginatedState<T extends { offset: number; limit: number, status?:string }, R, I> extends State<T, R> {
    items: I[];
    pagination: PaginationMeta | null;
}
