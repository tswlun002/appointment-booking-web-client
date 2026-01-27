import type {TokenResponse} from "~/domain/auth/TokenResponse";
import type {User} from "~/domain/user/User";

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
    logout: () => Promise<void>,
    login: (tokenResponse:TokenResponse) => Promise<void>
    refreshToken: (tokenResponse:TokenResponse)  => Promise<void>,
    user?:User
    emailVerificationResponseMessage?: string
    setEmailVerificationResponseMessage: (data:{email: string, message: string}) => void
}