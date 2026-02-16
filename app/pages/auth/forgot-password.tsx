import {Link} from "react-router";
import {forgotPasswordResources} from "~/resources/label/auth-labels";
import {CustomerInput} from "~/components/ui/inputs";
import {useForgotPasswordModel} from "~/model/auth/ForgotPasswordViewModel";
import Error from "~/components/ui/error";
import type {ForgotPasswordRequest} from "~/domain/user/generated/model";
import {colors, typography} from "~/resources/colors/colors";
import {Spinner} from "~/components/ui/spinner";
export default   function ForgotPassword(){


    const {state, model} = useForgotPasswordModel();


     const  isLoading = state.isLoading
    const formButtonLabel = (state?.isLoading)?"Loading ...":forgotPasswordResources?.forgotPasswordButton?.label;
    const isFormButtonDisabled = forgotPasswordResources?.forgotPasswordButton?.disabled || state?.isLoading;
    const hasError = state.errors?.response?.isError;
    const hasSuccess=  hasError && state?.response?.isSuccess || false;

    const responseMessage =state.errors?.response?.message|| state?.response?.data ||""

    return(
        <div
            className="flex flex-col items-center justify-center gap-4 w-full max-w-sm p-4 sm:max-w-lg md:max-w-xl lg:max-w-lg lg:gap-2"
            style={{ backgroundColor: colors.bgWhite }}
        >

            <div className="flex flex-row items-center gap-1 -mt-5">
                <p
                    className="text-xs sm:text-sm lg:text-sm"
                    style={{
                        color: colors.primaryDark,
                        ...typography.body
                    }}
                >
                    {forgotPasswordResources?.instructionMessage}
                </p>
            </div>

            <form onSubmit={model.submit} className={'flex flex-col justify-center w-full gap-5 px-5 flex-1 sm:text-lg'}>
                {/* Error/Success Message - Inline */}
                {hasError && (
                    <Error style={{ color: colors.red }} message={responseMessage} />
                )}

                {hasSuccess && (
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg" style={{ backgroundColor: colors.successLight }}>
                        <span style={{ color: colors.success, ...typography.bodySmall, fontWeight: "500" }}>
                            {responseMessage}
                        </span>
                    </div>
                )}
                <CustomerInput<ForgotPasswordRequest>
                    id={forgotPasswordResources?.email?.id}
                    label={forgotPasswordResources?.email?.label}
                    value={state?.userData?.email}
                    error={state?.errors}
                    type="email"
                    onChange={model.onChange}
                />
                <div className=" flex flex-col gap-4">
                    <button
                        type="submit"
                        disabled={isFormButtonDisabled}
                        className="w-full flex items-center justify-center gap-2 p-2 sm:p-4 lg:p-3 xl:p-3 rounded-lg font-semibold transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: colors.primary,
                            color: colors.white,
                        }}
                    >
                        {isLoading && <Spinner color={colors.white} className="h-4 w-4" />}
                        <span>{formButtonLabel}</span>
                    </button>
                    <p
                        className="text-center"
                        style={{
                            color: colors.textSecondary,
                            ...typography.bodySmall
                        }}
                    >
                        {forgotPasswordResources?.loginLinkButton?.label}
                        <Link
                            to={forgotPasswordResources?.loginLinkButton?.path}
                            className="px-1 underline hover:opacity-80 transition-opacity"
                            style={{
                                color: colors.primary,
                                fontWeight: typography.label.fontWeight
                            }}

                        >
                            {forgotPasswordResources?.loginLinkButton?.linkLabel}
                        </Link>
                    </p>
                </div>
            </form>

        </div>
    )
}