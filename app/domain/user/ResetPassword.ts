import {z} from  'zod'
import type {State} from "~/domain/State";
import {
    resetPasswordBody,
    resetPasswordBodyConfirmPasswordRegExp,
    resetPasswordBodyNewPasswordRegExp
} from "~/domain/user/generated/zod";
import type {PasswordResetRequest} from "~/domain/user/generated/model";
import type {
    RequestPasswordChangeMutationResult
} from "~/api/user/generated/endpoints/password-management/password-management";


export const ResetPasswordSchema = resetPasswordBody.extend({
    email: z.email({error:"Invalid email address"}),
    OTP: z.string({ error: "OTP is required" }).min(6, 'OTP must be at least 6 characters'),
    newPassword: z.string().regex(resetPasswordBodyNewPasswordRegExp,`Password must be ${resetPasswordBodyNewPasswordRegExp}+ char with uppercase,lowercase ,digit and special char`),
    confirmPassword: z.string().regex(resetPasswordBodyNewPasswordRegExp,`Password must be ${resetPasswordBodyConfirmPasswordRegExp}+ char with uppercase,lowercase ,digit and special char`)
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword", "newPassword"],
})


export  interface ResetPasswordState extends State<PasswordResetRequest,RequestPasswordChangeMutationResult> {
    instructionMessage:string
}