import {z} from 'zod';
import type {State} from "~/domain/State";
import { requestPasswordResetBody} from "~/domain/user/generated/zod";

import type {ForgotPasswordRequest} from "~/domain/user/generated/model";
import type {RequestPasswordResetMutationResult} from "~/api/user/generated/endpoints/password-reset/password-reset";

export const ForgotPasswordSchema= requestPasswordResetBody.extend({
    email: z.email({ error: "Invalid email address" }),
})

export interface ForgotPasswordState extends State<ForgotPasswordRequest,RequestPasswordResetMutationResult> {}