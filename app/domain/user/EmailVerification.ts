import {verifyUserBody} from "~/domain/user/generated/zod";
import {z} from "zod"
import type {State} from "~/domain/State";
import type {TokenResponse} from "~/domain/user/generated/model";
import type {
    VerifyUserMutationBody
} from "~/api/user/generated/endpoints/registration/registration";
export const EmailVerificationSchema = verifyUserBody.extend(
    {
        email: z.string({ error: "Email is required" })
            .email("Please enter a valid email address"),
        otp: z.string({ error: "OTP is required" }).min(6, "OTP must be at least 6 characters"),

    }
);

export  interface EmailVerificationState extends State<VerifyUserMutationBody,string  | TokenResponse> {}