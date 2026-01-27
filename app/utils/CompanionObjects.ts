

export  function isNonNull<T>(obj: T | null | undefined):boolean{

    return !isNull<T>(obj);
}
export  function isNull<T>(obj: T | null | undefined): boolean{

    return obj === null || obj === undefined;
}

export function isNotBlank<T>(obj: T | null | undefined): boolean {
    return !isBlank<T>(obj);
}

export function isBlank<T>(obj: T | null | undefined): boolean {
    if (obj === null || obj === undefined) return true;
    if (typeof obj === 'string') return obj.trim() === '';
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length ===0;
    return false;
}


export  function getTypedKeys<T extends object>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[];
}

export const TOKEN_EXPIRED_MESSAGE = "The access token expired";


export enum PasswordVisibility  {
    "TOGGLE_VISIBILITY",
"ALWAYS_VISIBLE","ALWAYS_HIDDEN"}
