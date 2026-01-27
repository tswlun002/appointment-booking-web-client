import {z} from "zod";

export const  BID_REGEX = new RegExp("^(?=.*[0-9]).{10}$")
export const PASSWORD_REGEX: RegExp= new RegExp("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!~@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?])(?!.*\\s).{6,}$")
export const USER_NAMES_MIN_LENGTH = 2
export const USER_NAMES_MAX_LENGTH = 32


export const Firstname = z.string().min(USER_NAMES_MIN_LENGTH, "Firstname must be at least 2 char").max(USER_NAMES_MAX_LENGTH,"Name is too long")
export const Lastname = z.string().min(USER_NAMES_MIN_LENGTH, "Firstname must be at least 2 char").max(USER_NAMES_MAX_LENGTH,"Name is too long")
export const Email = z.email("Invalid email address");
export const BID = z.string().regex(BID_REGEX, "BID must be 10 digits")
export const Password = z.string().regex(PASSWORD_REGEX,"Password must be 6+ char with uppercase,lowercase ,digit and special char ")


export const UserSchema = z.strictObject({
    firstname:Firstname,
    lastname: Lastname,
    email: Email,
    bid: BID,
});

export type User = z.infer<typeof UserSchema>;