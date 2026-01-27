import type {ClientRoles, EnvRoles} from "~/domain/auth/AuthResource";


export type JWTPayload ={
    exp: number,
    iat: number,
    jti: string,
    iss: string,
    aud: string,
    sub: string,
    typ: string,
    azp: string,
    sid: string,
    acr: string,
    "allowed-origins": string[],
    realm_access: EnvRoles,
    resource_access: ClientRoles,
    scope: string,
    email_verified: boolean,
    name: string,
    preferred_username: string,
    bid: string,
    given_name: string,
    family_name: string,
    email: string
}