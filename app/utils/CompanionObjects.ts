import {date} from "zod";


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


export const DayOfWeek =  [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
]

const options = {timeZone: 'Africa/Johannesburg'};
const locale = "en-ZA";
const saDate = new Date().toLocaleString('en-ZA', options);

export const LocalDate ={
    get now() { return new Date(new Date().toLocaleString(locale, options)); },
    month: new Intl.DateTimeFormat(locale, {month: 'long'}).format(new Date(saDate)),
    /**
     * format date to YY-MM-DD
     * @param date to format to YY-MM-DD
     */
    formattedDate: (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    },
     dayName (date:Date){return  new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);},
     shortDayName(date:Date) {return  new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);},
     dayOfTheMonth(date:Date) {return date.getDate().toString().padStart(2, '0')},
     formattedTime(date:Date){ return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true // Set to true for AM/PM
    }).format(date)}
}