import type { State } from "~/domain/State";
import type { TypeError } from "~/domain/error/Error";

/** Logout request - empty since logout doesn't require input */
export interface LogoutRequest {}

/** Logout response - void since logout returns nothing */
export type LogoutResponse = void;

/** Logout state following State pattern */
export interface LogoutState extends State<LogoutRequest, LogoutResponse> {
    userData: LogoutRequest;
    errors: TypeError<LogoutRequest>;
    isLoading: boolean;
}

/** Initial logout state */
export const initialLogoutState: LogoutState = {
    userData: {},
    errors: {
        response: {
            isError: false,
            message: ""
        }
    } as TypeError<LogoutRequest>,
    isLoading: false,
    response: {
        isSuccess: false,
    }
};

