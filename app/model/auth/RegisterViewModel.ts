import type {Error, TypeError} from "~/domain/error/Error"
import {type ChangeEvent, type Dispatch, useEffect, useMemo, useReducer} from "react";
import {createZodResolver} from "~/model/auth/zod/ZodResolver";
import {isNotBlank} from "~/utils/CompanionObjects";
import type {UseMutationResult} from "@tanstack/react-query";
import {type NavigateFunction, useNavigate} from "react-router";
import {ViewModel} from "~/model/ViewModel";
import {type ActionDispatch, ActionEvent} from "~/model/ActionEvent";
import {useRegisterUser} from "~/api/user/generated/endpoints/registration/registration";
import {type RegisterState, registerUserSchema} from "~/domain/user/Register";
import type {ErrorResponse, NewUserRequest} from "~/domain/user/generated/model";


const VALIDATION_DELAY_TIME_SECOND =1500
const NAVIGATION_DELAY_TIME_SECOND=1500

export const useRegisterModel = () => {

  const reducer = ViewModel.reducer<NewUserRequest,string,RegisterState>(initialRegisterState);
  const [state, dispatch] = useReducer(reducer, initialRegisterState);
  const registerMutation = useRegisterUser();
  const navigateFunction = useNavigate();

  const resolver = useMemo(
      () => createZodResolver<NewUserRequest,TypeError<NewUserRequest>>(registerUserSchema),
      []
  );
  useEffect(()=>{
    model.catchStateChange(state);
  },[state?.response?.isSuccess])

  const model = useMemo(
      () => new RegisterModel(state, dispatch, resolver,registerMutation,navigateFunction),
      [state, registerMutation]
  );

  return {
    state,
    model,
  };
};


export class RegisterModel extends ViewModel<NewUserRequest,string, RegisterState>{

    constructor(
      protected state: RegisterState,
      protected dispatch: Dispatch<ActionDispatch<NewUserRequest>>,
      protected resolver: (data: NewUserRequest) => Promise<{ errors?:TypeError<NewUserRequest>; values?: NewUserRequest }>,
      private  registerMutation:  UseMutationResult<string, ErrorResponse, { data: NewUserRequest }, unknown>,
      private  navigateFunction: NavigateFunction

  ) {
    super(state, dispatch,resolver, initialRegisterState);
  }

  onChange = async (event: ChangeEvent<HTMLInputElement>) => {

      event.preventDefault();
      const key = event.target.id as keyof NewUserRequest;

      const value = event.target.value;

      this.clearTimeout();
      // 2. Schedule new validation with the latest value
      this.validationTimeout = setTimeout(() => this.validateForm(key, value), VALIDATION_DELAY_TIME_SECOND);

      this.dispatch({type: ActionEvent.SET_FIELD, field: key, value});

  };


  private getError = (errorKey:string,error:Error):TypeError<NewUserRequest>=>{


    const passwordErrors :Record<keyof TypeError<NewUserRequest>, Error> ={} as TypeError<NewUserRequest>;

    const confirmPassword = "confirmPassword";
    const password = "password";

    if(errorKey==password){

      passwordErrors[errorKey]= error;
      passwordErrors[confirmPassword]= error

    }
    else if(errorKey==confirmPassword){
      passwordErrors[errorKey]= error;
      passwordErrors[password]= error

    }
    else {
      passwordErrors[errorKey as keyof TypeError<NewUserRequest>]=error
    }

    return passwordErrors;

  }

  protected validateForm = async (key: string, value:string  ):Promise<Boolean> => {

    const data = {...this.state.userData,[key]:value };
    const result = await this.resolver(data);
    const errorKey = key as keyof TypeError<NewUserRequest>;

    if (isNotBlank<TypeError<NewUserRequest>>(result.errors) && result.errors !== undefined) {

      const error = result.errors[errorKey];

      const notBlank = isNotBlank<Error>(error);


      const passwordErrors = notBlank?this.getError(errorKey, error):
          this.getError(errorKey,initialRegisterState.errors[errorKey]);

      this.dispatch({ type: ActionEvent.SET_ERROR, errors:{...this.state.errors,...passwordErrors } });
      return false;
    }
    else{

      this.dispatch({ type:ActionEvent.CLEAR_ERRORS });
      return true;

    }
  };

  public submitToAPI =   (userRegister: NewUserRequest) :Promise<String>=>  {
      return  this.registerMutation?.mutateAsync({data:userRegister},this.registerMutationOptions())
  };
  private registerMutationOptions =()=>{

    return {
      onSuccess: (data:string) => {
        this.dispatch({ type: ActionEvent.SET_API_RESPONSE_SUCCESS, isSuccess: true, message:data });

      },
      onError: (error:ErrorResponse) => {
        const message = error.message||error.error;
        this.dispatch({type: ActionEvent.SET_API_ERROR,error: {isError: true, message: message }});
      },
    }
  }

  catchStateChange(state: RegisterState) {
    if(state.response?.isSuccess){
      setTimeout(()=>{
        const emailVerification = "email-verification";
        this.navigateFunction(emailVerification, {replace:true})
      },NAVIGATION_DELAY_TIME_SECOND)
    }
  }

    onToggle(key:string ) {
        const field = key as keyof NewUserRequest;
        const value = !this.state.userData.isCapitecClient;
        this.dispatch({type: ActionEvent.TOGGLE_MODAL, field: field, value: value});
    }
}
const createDefaultError = (): Error => ({ isError: false, message: '' });

export const initialRegisterState: RegisterState = {
    userData: {
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: '',
        idNumber:'',
        isCapitecClient:true
    },
    errors: Object.fromEntries(
        ['firstname', 'lastname', 'email', 'password', 'confirmPassword', 'response', 'idNumber', 'isCapitecClient']
        .map(key => [key, createDefaultError()])
    ) as TypeError<NewUserRequest>,
    isLoading: false,
};



