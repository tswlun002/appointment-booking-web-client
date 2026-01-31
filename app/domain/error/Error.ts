export interface  Error {
    message?: string
    status?: number | 500
    isError: boolean
}

export type  TypeError<T> =Record<keyof T | 'response', Error>

