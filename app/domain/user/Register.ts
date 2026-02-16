import type {State} from "~/domain/State";
import {z} from "zod";
import {
    registerUserBodyPasswordRegExp,
    registerUserBodyConfirmPasswordRegExp,
    registerUserBodyFirstnameMin,
    registerUserBodyFirstnameRegExp,
    registerUserBodyLastnameMin,
    registerUserBodyLastnameRegExp,
    registerUserBodyIdNumberRegExp, registerUserBody,
} from "~/domain/user/generated/zod";
import type {RegisterUserMutationBody} from "~/api/user/generated/endpoints/registration/registration";

export interface RegisterState extends State<RegisterUserMutationBody,string> {}

/**
 * Wrapper for registerUserBody with custom validation messages
 * and password confirmation matching
 */
export const registerUserSchema = registerUserBody.extend({
        email: z
            .string({ error: "Email is required" })
            .email("Please enter a valid email address"),
        password: z
            .string({ error: "Password is required" })
            .regex(
                registerUserBodyPasswordRegExp,
                "Password must be at least 6 characters and include uppercase, lowercase, number, and special character"
            ),
        confirmPassword: z
            .string({ error: "Confirm password is required" })
            .regex(
                registerUserBodyConfirmPasswordRegExp,
                "Password must be at least 6 characters and include uppercase, lowercase, number, and special character"
            ),
        firstname: z
            .string({ error: "First name is required" })
            .min(registerUserBodyFirstnameMin, "First name must be at least 2 characters")
            .regex(registerUserBodyFirstnameRegExp, "First name must contain only letters"),
        lastname: z
            .string({ error: "Last name is required" })
            .min(registerUserBodyLastnameMin, "Last name must be at least 2 characters")
            .regex(registerUserBodyLastnameRegExp, "Last name must contain only letters"),
        idNumber: z
            .string()
            .regex(registerUserBodyIdNumberRegExp, "ID number must be exactly 13 digits")
            .optional(),
        isCapitecClient: z.boolean().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword", "password"],
    });


