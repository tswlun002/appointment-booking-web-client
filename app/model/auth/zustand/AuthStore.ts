import {create} from "zustand/react";
import {jwtDecode} from "jwt-decode";
import type {JWTPayload} from "~/domain/auth/JWTPayLoad";
import type {Auth, ClientRoles, EnvRoles, Role} from "~/domain/auth/AuthResource";
import type {User} from "~/domain/user/User";
import {isNotBlank} from "~/utils/CompanionObjects";
import type {TokenResponse} from "~/domain/user/generated/model";

const useAuthStore = create<Auth>((set, get) => ({
    token: {
        accessToken:  ""
    },
    roles:{} as Role,
    realmAccess:{} as EnvRoles,
    resourceAccess:{} as ClientRoles,
    isAuthenticated: false,
    registeringUser: async (email:string, isCapitecClient:boolean)=>{
        set(()=>({
             isCapitecClient:isCapitecClient,
             user:{  firstname: "", lastname: "", email: email, username: ""}
        }))
    },
    refreshToken: async (tokenResponse:TokenResponse)  => {
        set(()=>({
            token:{accessToken:tokenResponse.access_token, idToken:tokenResponse.id_token},
        }));
    },

    login: async (tokenResponse) => {

        console.log(tokenResponse);
      const accessToken = tokenResponse.access_token!;
      const payload = jwtDecode<JWTPayload>(accessToken);
      const envRole = payload.realm_access;
      const clientRoles = payload.resource_access;
      const  roles = payload.roles??[];
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
          roles: roles,
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