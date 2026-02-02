import type {ChangeEvent, Dispatch, FormEvent} from "react";
import type {Error, TypeError} from "~/domain/error/Error";
import {isNotBlank} from "~/utils/CompanionObjects";
import {type ActionDispatch, ActionEvent} from "~/model/ActionEvent";
import type {State} from "~/domain/State";

/**
 * @T   model type
 * @S   state type
 * @R  Expected response model type
 */
export abstract  class ViewModel<T,R, S extends State<T,R>>{
    // track timeout refs to clean up memory
    protected validationTimeout: NodeJS.Timeout | null = null;

    constructor(
        protected state: S,
        protected dispatch: Dispatch<ActionDispatch<T,R>>,
        protected resolver: (data: T) => Promise<{ errors?: TypeError<T>; values?: T }>,
        private initialState: S,
        public  VALIDATION_DELAY_TIME_SECOND:number = 1500
    ) {

    }
    onChange = async (event: ChangeEvent<HTMLInputElement>) => {

        event.preventDefault();
        const field = event.target.id as keyof T;
        const value = event.target.value;
        this.clearTimeout()
        // 2. Schedule new validation with the latest value
        this.validationTimeout = setTimeout(() => this.validateForm(field , value), this.VALIDATION_DELAY_TIME_SECOND)
        this.dispatch({type: ActionEvent.SET_FIELD, field:field, value:value});
    };
    /** track timeout refs
        1. Cancel any pending validation from the previous keystroke
    */
    protected  clearTimeout = () => {
        if (this.validationTimeout) {
            clearTimeout(this.validationTimeout);
        }
    }

    protected  validateForm = async (key: keyof T, value: string): Promise<Boolean> => {

        const data = {...this.state.userData, [key]: value};
        const result = await this.resolver({...data});

        const errorKey = key as keyof TypeError<T>;

        if (isNotBlank<TypeError<T>>(result.errors) && result.errors !== undefined) {

            let error = result.errors[errorKey];

            error = isNotBlank<Error>(error) ? error : this.initialState.errors[errorKey];

            this.dispatch({type: ActionEvent.SET_ERROR, errors: {...this.state.errors, [errorKey]: error}});

            return false;
        }

        this.dispatch({type: ActionEvent.CLEAR_ERRORS});
        return true;
    };

    submit = async (event: FormEvent<HTMLFormElement>) => {

        event.preventDefault();
        const result = await this.resolver(this.state.userData);

        const errors = result.errors;
        if (isNotBlank<TypeError<T>>(errors)) {

            this.dispatch({type: ActionEvent.SET_ERROR, errors: {...this.state.errors, ...errors}});
            return;
        }

        this.dispatch({type: ActionEvent.SET_LOADING, isLoading: true});
        this.submitToAPI(this.state.userData);

    };
     submitToAPI(data?:T):void{
         //TODO need implementation to make server calls
     }

     catchStateChange(state: S): void{
         //TODO need implementation  if navigate after api response

     }

    protected async executeQuery<E>(
        query: () => Promise<{
            isError: boolean,
            error: E |null,
            status:string,
            isLoading: boolean,
            isSuccess: boolean,
            isFetching: boolean,
            data: R | undefined
        }>): Promise<R|undefined> {

         this.dispatch({type: ActionEvent.SET_LOADING, isLoading: true});

         try{

             const result = await query();
             this.handleQueryResults(result);
             return  result.data;

         }catch(error){
             const typeError = error as TypeError<R>;
             this.dispatch({
                 type: ActionEvent.SET_API_ERROR,
                 error: {
                     isError: true,
                     message: typeError.response?.message || "Request failed, please try again.",
                     status: typeError.response?.status||500,
                 },
             });
             return undefined;
         }
    }

    static reducer = <T,R, S extends State<T,R>>(initialState:S) => {
        return (state: S, action: ActionDispatch<T,R>): S =>{
            switch (action.type) {
                    case ActionEvent.SET_FIELD: {
                         if(action.data !== undefined) {

                             return {...state, userData: {...state.userData,...action.data, [action.field!]: action.value}};
                         }
                         else{
                             return {...state, userData: {...state.userData, [action.field!]: action.value}};

                         }
                    }
                    case ActionEvent.TOGGLE_MODAL: {
                        return {...state, userData: {...state.userData,[action.field]:action.value}}
                    }
                    case ActionEvent.SUBMIT: {

                        return {...initialState, ...action, isLoading: false, errors: initialState.errors}
                    }
                    case ActionEvent.SET_API_RESPONSE_SUCCESS: {

                       if(action.field !== undefined) {
                           return {
                               ...state,
                               response: {isSuccess: true,message:action.message, data: action.data,status: action.status},
                               isLoading: false,
                               errors: {...initialState.errors,}
                           };
                       }
                       else {
                           return {
                               ...state,
                               response: {isSuccess: true,message:action.message, data: action.data,status: action.status},
                               isLoading: false,
                               userData:{...state.userData,[action.field!]:action.value},
                               errors: {...initialState.errors,}
                           };
                       }

                    }
                    case ActionEvent.SET_API_ERROR: {

                        return {...state, isLoading: false, errors: {...initialState.errors, response: action.error}};

                    }
                    case ActionEvent.SET_LOADING: {

                        return {...state, isLoading: action.isLoading}
                    }
                    case ActionEvent.SET_ERROR: {

                        return {...state, isLoading: false, errors: action.errors}
                    }

                    case ActionEvent.CLEAR_ERRORS: {

                        return {...state, isLoading: false, errors: {...initialState.errors, response:state.errors.response}}
                    }
                    case ActionEvent.RESET_FORM: {
                        return initialState
                    }
                    default: {
                        return state;
                    }
                }
            };
    }

    protected handleQueryResults<E>(result: {
        isError: boolean;
        error: E  | null;
        status: string;
        isLoading: boolean;
        isSuccess: boolean;
        isFetching: boolean;
        data: R | undefined
    }) {
        const {isSuccess, isLoading, isFetching, isError,error, data}=result;
        if(isFetching || isLoading){
            this.dispatch({type: ActionEvent.SET_LOADING, isLoading: true});
            return;
        }
        if(isSuccess && data){
            this.dispatch({type:ActionEvent.SET_API_RESPONSE_SUCCESS, isSuccess:true, message:"fetched successfully",data:data})
        }

        if(isError){
            const err = error as Error | undefined;
            this.dispatch({type:ActionEvent.SET_API_ERROR,
            error:{
                isError:isError,
                message: err?.message || "Request failed, please try again.",
                status: err?.status||500,
            }
            })
        }
    }
}