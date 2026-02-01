import {loginBody} from "~/domain/auth/generated/zod";
import {z} from "zod"
import {isNotBlank} from "~/utils/CompanionObjects";
import type {State} from "~/domain/State";
import type {LoginRequest, TokenResponse} from "~/domain/auth/generated/model";

export const LoginSchema = loginBody.extend({
    email: z.email("Invalid email address"),
    password: z.string()
}).refine(data=>isNotBlank<String>(data.password),
    {
        message: "Passwords is required",
        path: ["password"],
    }
)

export  interface LoginState extends  State<LoginRequest,TokenResponse>{}

