import type {State} from "~/domain/State";
import type {NewUserRequest} from "~/domain/user/generated/model";
import {z} from "zod";

export interface RegisterState extends State<NewUserRequest,string> {}

const zodOb = z.strictObject<NewUserRequest>({
    confirmPassword: "",
    email: "",
    firstname: "",
    idNumber: "",
    isCapitecClient: false,
    lastname: "", password: ""

});