import type {Error, TypeError} from "~/domain/error/Error";


export enum Action {
    SET_FIELD = 'SET_FIELD',
    SET_LOADING = 'SET_LOADING',
    SUBMIT = 'SUBMIT',
    SET_API_RESPONSE_SUCCESS = 'SET_API_RESPONSE_SUCCESS',
    SET_API_ERROR = 'SET_API_ERROR',
    SET_ERROR = 'SET_ERROR',
    CLEAR_ERRORS = 'CLEAR_ERRORS',
    RESET_FORM = 'RESET_FORM',
}

export class ActionEvent {
    static SET_FIELD: typeof Action.SET_FIELD = Action.SET_FIELD;
    static SET_LOADING: typeof Action.SET_LOADING = Action.SET_LOADING;
    static SUBMIT: typeof Action.SUBMIT = Action.SUBMIT;
    static SET_API_RESPONSE_SUCCESS: typeof Action.SET_API_RESPONSE_SUCCESS = Action.SET_API_RESPONSE_SUCCESS;
    static SET_API_ERROR: typeof Action.SET_API_ERROR = Action.SET_API_ERROR;
    static SET_ERROR: typeof Action.SET_ERROR = Action.SET_ERROR;
    static CLEAR_ERRORS: typeof Action.CLEAR_ERRORS = Action.CLEAR_ERRORS;
    static RESET_FORM: typeof Action.RESET_FORM = Action.RESET_FORM;

}

/**
 * @T is the model type
 */
export  type ActionDispatch<T> =
    | { type: typeof ActionEvent.SET_FIELD; field: keyof T; value: string }
    | { type: typeof ActionEvent.SET_LOADING; isLoading: boolean }
    | { type: typeof ActionEvent.SET_API_RESPONSE_SUCCESS; isSuccess?: boolean; message: string; status?: number }
    | { type: typeof ActionEvent.SET_API_ERROR, error: Error }
    | { type: typeof ActionEvent.SUBMIT; state?: T }
    | { type: typeof ActionEvent.SET_ERROR; errors: TypeError<T> }
    | { type: typeof ActionEvent.CLEAR_ERRORS }
    | { type: typeof ActionEvent.RESET_FORM };