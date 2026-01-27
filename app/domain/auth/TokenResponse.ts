export interface TokenResponse {
    otherClaims: Record<string, any>;
    access_token: string,
    expires_in: number,
    token_type: string,
    id_token: string,
    "not-before-policy": 0,
    session_state: string,
    scope: string,
    error?:string,
    error_description?: string,
    error_uri?: string
}