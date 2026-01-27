import {create} from "zustand/react";
import {jwtDecode} from "jwt-decode";
import type {JWTPayload} from "~/domain/auth/JWTPayLoad";
import type {Auth, ClientRoles, EnvRoles} from "~/domain/auth/AuthResource";
import type {User} from "~/domain/user/User";
import type {TokenResponse} from "~/domain/auth/TokenResponse";
import {isNotBlank} from "~/utils/CompanionObjects";


const useAuthStore = create<Auth>((set, get) => ({
    token: {
        accessToken:  ""
    },
    realmAccess:{} as EnvRoles,
    resourceAccess:{} as ClientRoles,
    isAuthenticated: false,
    refreshToken: async (tokenResponse:TokenResponse)  => {
        set(()=>({
            token:{accessToken:tokenResponse.access_token, idToken:tokenResponse.id_token},
        }));
    },

    login: async (tokenResponse) => {

      const accessToken = tokenResponse.access_token;
      const payload = jwtDecode<JWTPayload>(accessToken);
      const envRole = payload.realm_access;
      const clientRoles = payload.resource_access;

      const user:User ={
          username: payload.username,
          email:payload.email,
          firstname: payload.given_name,
          lastname: payload.family_name,
      }


      set(()=>({
          token:{
              accessToken:accessToken,
              idToken:tokenResponse.id_token
          },
          isAuthenticated:isNotBlank<string>(accessToken),
          resourceAccess:clientRoles,
          realmAccess:envRole,
          user:user,
      }));


    },
   logout: async() =>{
      set(()=>({
          token:undefined,
          realmAccess:undefined,
          resourceAccess:undefined,
          isAuthenticated: false,
          user:undefined
      }))
   },
    setEmailVerificationResponseMessage(data:{email: string, message: string}){
        set(()=>({
            emailVerificationResponseMessage:data.message   ,
            user:{
                email: data.email,
                username: "",
                firstname: "",
                lastname: "",
            }
        }))
    }

}));
export default useAuthStore;