import {memo} from "react";
import {Link} from "react-router";
import {CustomerInput, PasswordInput} from "~/components/ui/inputs";
import {useResetPasswordViewModel} from "~/model/auth/ResetPasswordViewModel";
import Error from "~/components/ui/error";
import {resetPasswordResources} from "~/resources/label/auth-labels";
import {isNotBlank} from "~/utils/CompanionObjects";
import type {PasswordResetRequest} from "~/domain/user/generated/model";
import {colors, typography} from "~/resources/colors/colors";
import {PrimaryButton} from "~/components/ui/buttons";

const ResetPassword = memo(() => {

    const {state, model} = useResetPasswordViewModel();

    const isLoading = state?.isLoading;
    const formButtonLabel = isLoading ? "Resetting..." : resetPasswordResources?.resetPasswordButton?.Label;
    const isFormButtonDisabled = resetPasswordResources?.resetPasswordButton?.disabled || state?.isLoading;

    // Response handling - prioritize current page response over instruction message from previous page
    const hasCurrentPageResponse = state?.response?.isSuccess || state.errors?.response?.isError;
    const hasError = state.errors?.response?.isError;
    const hasSuccess = !hasError && state?.response?.isSuccess;

    // Show instruction message only if no current page response yet
    const showInstructionMessage = !hasCurrentPageResponse && isNotBlank(state.instructionMessage);

    // Determine which message to show
    const errorMessage = state?.errors?.response?.message || "";
    const successMessage = state?.response?.data as string || "";
    const instructionMessage = state.instructionMessage || "";

    return (
        <div
            className="flex flex-col items-center justify-center gap-4 w-full max-w-sm p-4 sm:max-w-lg md:max-w-xl lg:max-w-lg lg:gap-2"
            style={{ backgroundColor: colors.bgWhite }}
        >
            {/* Header Section */}
            <div className="flex flex-col items-center gap-2">
                <p
                    style={{
                        color: colors.primaryDark,
                        ...typography.h4
                    }}
                >
                    {resetPasswordResources.headerTitle}
                </p>
            </div>

            <form onSubmit={model.submit} className="flex w-full flex-col gap-5 px-5 flex-1">
                {/* Instruction Message from previous page */}
                {showInstructionMessage && (
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg" style={{ backgroundColor: colors.successLight }}>
                        <span style={{ color: colors.success, ...typography.bodySmall, fontWeight: "500" }}>
                            ✓ {instructionMessage}
                        </span>
                    </div>
                )}

                {/* Error Message from current page */}
                {hasError && (
                    <Error style={{ color: colors.red }} message={errorMessage} />
                )}

                {/* Success Message from current page */}
                {hasSuccess && (
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg" style={{ backgroundColor: colors.successLight }}>
                        <span style={{ color: colors.success, ...typography.bodySmall, fontWeight: "500" }}>
                            ✓ {successMessage}
                        </span>
                    </div>
                )}

                {/* OTP Input */}
                <CustomerInput<PasswordResetRequest>
                    id={resetPasswordResources.otp?.id}
                    label={resetPasswordResources.otp?.label}
                    value={state?.userData?.OTP}
                    error={state.errors}
                    type="text"
                    onChange={model.onChange}
                />

                {/* New Password Input */}
                <PasswordInput<PasswordResetRequest>
                    label={resetPasswordResources.password?.label}
                    id={resetPasswordResources.password?.id}
                    passwordVisibilityStatus={resetPasswordResources?.password?.passwordVisibility}
                    value={state?.userData?.newPassword}
                    error={state.errors}
                    onChange={model.onChange}
                />

                {/* Confirm Password Input */}
                <PasswordInput<PasswordResetRequest>
                    label={resetPasswordResources.confirmPassword?.label}
                    id={resetPasswordResources?.confirmPassword?.id}
                    passwordVisibilityStatus={resetPasswordResources?.confirmPassword?.passwordVisibility}
                    value={state?.userData?.confirmPassword}
                    error={state.errors}
                    onChange={model.onChange}
                />

                {/* Submit Button & Login Link */}
                <div className="flex flex-col gap-4">
                    <PrimaryButton
                        label={formButtonLabel}
                        type="submit"
                        disabled={isFormButtonDisabled}
                        isLoading={isLoading}
                    />
                    <p
                        className="text-center"
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
});

export default ResetPassword;
