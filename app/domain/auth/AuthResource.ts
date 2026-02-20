import type {User} from "~/domain/user/User";
import type {TokenResponse} from "~/domain/user/generated/model";

export type Role = string[]
export type EnvRoles=Record<string,Role>
export type ClientRoles=Record<string, EnvRoles>
export interface JWT {
    accessToken?: string;
    idToken?: string;
}

export type Auth ={
    token?: JWT,
    roles?: Role,
    realmAccess?: EnvRoles,
    resourceAccess?: ClientRoles,
    isAuthenticated: boolean,
    isCapitecClient?:boolean,
    /** Clears frontend state only - called by LogoutModelView after API logout */
    logout: () => Promise<void>,
    login: (tokenResponse:TokenResponse) => Promise<void>
    refreshToken: (tokenResponse:TokenResponse)  => Promise<void>,
    user?:User
    emailVerificationResponseMessage?: string
    setEmailVerificationResponseMessage: (data:{email: string, message: string}) => void,
    registeringUser: (email:string, isCapitecClient:boolean)=>Promise<void>,

}