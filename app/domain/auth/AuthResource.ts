import type {User} from "~/domain/user/User";
import type {TokenResponse} from "~/domain/user/generated/model";

export type EnvRoles=Record<string,string[]>
export type ClientRoles=Record<string, EnvRoles>

export interface JWT {
    accessToken?: string;
    idToken?: string;
}

export type Auth ={
    token?: JWT,
    realmAccess?: EnvRoles,
    resourceAccess?: ClientRoles,
    isAuthenticated: boolean,
    isCapitecClient?:boolean,
    logout: () => Promise<void>,
    login: (tokenResponse:TokenResponse) => Promise<void>
    refreshToken: (tokenResponse:TokenResponse)  => Promise<void>,
    user?:User
    emailVerificationResponseMessage?: string
    setEmailVerificationResponseMessage: (data:{email: string, message: string}) => void
}