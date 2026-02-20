import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { jwtDecode } from "jwt-decode"
import type { JWTPayload } from "~/domain/auth/JWTPayLoad"
import type { Auth, ClientRoles, EnvRoles } from "~/domain/auth/AuthResource"
import type { User } from "~/domain/user/User"
import { isNotBlank } from "~/utils/CompanionObjects"
import type { TokenResponse } from "~/domain/user/generated/model"

const useAuthStore = create<Auth>()(
    persist(
        (set) => ({
            token: {
                accessToken: ""
            },
            roles: [],
            realmAccess: {} as EnvRoles,
            resourceAccess: {} as ClientRoles,
            isAuthenticated: false,

            registeringUser: async (email: string, isCapitecClient: boolean) => {
                set(() => ({
                    isCapitecClient: isCapitecClient,
                    user: { firstname: "", lastname: "", email: email, username: "" }
                }))
            },

            refreshToken: async (tokenResponse: TokenResponse) => {
                set(() => ({
                    token: { accessToken: tokenResponse.access_token, idToken: tokenResponse.id_token },
                }))
            },

            login: async (tokenResponse) => {
                const accessToken = tokenResponse.access_token!
                const payload = jwtDecode<JWTPayload>(accessToken)
                const envRole = payload.realm_access
                const clientRoles = payload.resource_access
                const roles = payload.roles ?? []
                const user: User = {
                    username: payload.preferred_username,
                    email: payload.email,
                    firstname: payload.given_name,
                    lastname: payload.family_name,
                }

                set(() => ({
                    token: {
                        accessToken: accessToken,
                        idToken: tokenResponse.id_token
                    },
                    isAuthenticated: isNotBlank<string>(accessToken),
                    resourceAccess: clientRoles,
                    realmAccess: envRole,
                    user: user,
                    roles: roles,
                }))
            },

            /** Clears frontend state only - called by LogoutModelView after API logout */
            logout: async () => {
                // Clear all caches from session storage
                const { clearAllCaches } = await import("~/lib/react-query/Client");
                clearAllCaches();

                useAuthStore.persist.clearStorage();
                set(() => ({
                    token: undefined,
                    realmAccess: undefined,
                    resourceAccess: undefined,
                    isAuthenticated: false,
                    user: undefined,
                    roles: undefined,
                }))
            },

            setEmailVerificationResponseMessage(data: { email: string, message: string }) {
                set(() => ({
                    emailVerificationResponseMessage: data.message,
                    user: {
                        email: data.email,
                        username: "",
                        firstname: "",
                        lastname: "",
                    }
                }))
            }
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => sessionStorage),

            // IMPORTANT: Don't persist tokens (security)
            partialize: (state) => ({
                user: state.user,
                roles: state.roles,
                realmAccess: state.realmAccess,
                resourceAccess: state.resourceAccess,
                isAuthenticated: state.isAuthenticated,
                isCapitecClient: state.isCapitecClient,
                emailVerificationResponseMessage: state.emailVerificationResponseMessage
            })
        }
    )
)

export default useAuthStore