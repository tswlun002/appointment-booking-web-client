import {Link} from "react-router";
import {CustomerInput, PasswordInput} from "~/components/ui/inputs";
import {useResetPasswordViewModel} from "~/model/auth/ResetPasswordViewModel";
import Error from "~/components/ui/error";
import {resetPasswordResources} from "~/resources/label/auth-labels";
import {isNotBlank} from "~/utils/CompanionObjects";
import type {PasswordResetRequest} from "~/domain/user/generated/model";
import {colors, typography} from "~/resources/colors/colors";
import {Spinner} from "~/components/ui/spinner";

export default function ForgotPassword() {

    const {state, model} = useResetPasswordViewModel();

    const isLoading = state?.isLoading;
    const formButtonLabel = (state?.isLoading) ? "Loading ..." : resetPasswordResources?.resetPasswordButton?.Label;
    const isFormButtonDisabled = resetPasswordResources?.resetPasswordButton?.disabled || state?.isLoading;

    const hasError = state.errors?.response?.isError ;

    const  hasSuccess = !hasError && state?.response?.isSuccess|| isNotBlank( state.instructionMessage) || false;
    const responseMessage = state?.errors?.response?.message || state?.response?.data as string || state.instructionMessage||""

    return (
        <div className="'flex flex-col items-center justify-center gap-4  w-full max-w-sm  p-4  sm:text-2xl sm:max-w-lg
        md:text-3xl md:max-w-xl  lg:text-xl lg:max-w-lg lg:gap-2'">

            <div className="flex flex-col text-center gap-10">
                <p>
                    {resetPasswordResources.headerTitle}
                </p>
            </div>

            <form onSubmit={model.submit}
                  className={'flex flex-col justify-center w-full gap-5 px-5 flex-1 sm:text-lg'}>
                {/* Error/Success Message - Inline */}
                {hasError && (
                    <Error style={{ color: colors.red }} message={responseMessage} />
                )}

                {hasSuccess && (
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg" style={{ backgroundColor: colors.successLight }}>
                        <span style={{ color: colors.success, ...typography.bodySmall, fontWeight: "500" }}>
                            ✓ {responseMessage}
                        </span>
                    </div>
                )}
                <CustomerInput<PasswordResetRequest>
                    id={resetPasswordResources.otp?.id}
                    label={resetPasswordResources.otp?.label}
                    value={state?.userData?.OTP}
                    error={state.errors}
                    type={"text"}
                    onChange={model.onChange}
                />
                <PasswordInput<PasswordResetRequest>
                    label={resetPasswordResources.password?.label}
                    id={resetPasswordResources.password?.id}
                    passwordVisibilityStatus={resetPasswordResources?.password?.passwordVisibility}
                    value={state?.userData?.newPassword}
                    error={state.errors}
                    onChange={model.onChange}
                />
                <PasswordInput<PasswordResetRequest>
                    label={resetPasswordResources.confirmPassword?.label}
                    id={resetPasswordResources?.confirmPassword?.id}
                    passwordVisibilityStatus={resetPasswordResources?.confirmPassword?.passwordVisibility}
                    value={state?.userData?.confirmPassword}
                    error={state.errors}
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
                    <p  className="text-center"
                        style={{
                            color: colors.textSecondary,
                            ...typography.bodySmall
                        }}
                    >
                        {resetPasswordResources.loginLinkButton?.label}
                        <Link
                            to={resetPasswordResources.loginLinkButton?.path}
                            className="px-1 underline hover:opacity-80 transition-opacity"
                            style={{
                                color: colors.primary,
                                fontWeight: typography.label.fontWeight
                            }}
                        >
                            {resetPasswordResources.loginLinkButton?.linkLabel}
                        </Link>
                    </p>
                </div>
            </form>

        </div>
    )
}