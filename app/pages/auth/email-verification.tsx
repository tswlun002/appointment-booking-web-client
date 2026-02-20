import { memo } from "react";
import { Link } from "react-router";
import { CustomerInput } from "~/components/ui/inputs";
import { useEmailVerificationModel } from "~/model/auth/EmailVerificationViewModel";
import { COMPANY_DATA, EmailVerificationScreenResources } from "~/resources/label/auth-labels";
import Error from "~/components/ui/error";
import type { VerifyUserMutationBody } from "~/api/user/generated/endpoints/registration/registration";
import { colors, typography } from "~/resources/colors/colors";
import { PrimaryButton } from "~/components/ui/buttons";

const EmailVerification = memo(() => {
    const { state, model } = useEmailVerificationModel();

    // Derived state
    const isLoading = state?.isLoading;
    const formButtonLabel = isLoading ? "Verifying..." : EmailVerificationScreenResources?.emailVerificationButton.label;
    const isFormButtonDisabled = EmailVerificationScreenResources?.emailVerificationButton?.disabled || isLoading;

    // Response handling
    const hasError = state.errors?.response?.isError;
    const hasSuccess = state?.response?.isSuccess;
    const hasRegistrationMessage = state.additionalData?.isSuccess && state.additionalData?.registrationResponseMessage;
    const responseMessage = state.errors?.response?.message || "";
    const successMessage = state.response?.data as string || "";
    const registrationMessage = state.additionalData?.registrationResponseMessage || "";

    return (
        <div
            className="flex flex-col items-center justify-center gap-4 w-full max-w-sm p-4 sm:max-w-lg md:max-w-xl lg:max-w-lg lg:gap-2"
            style={{ backgroundColor: colors.bgWhite }}
        >
            {/* Header Section */}
            <div className="flex flex-col gap-10">
                <div className="flex flex-col items-center py-3">
                    <img
                        src="/capitec.svg"
                        alt="Capitec"
                        width={100}
                        height={100}
                        className="-mb-12"
                    />
                </div>

                <p
                    className="py-3"
                    style={{
                        color: colors.textSecondary,
                        ...typography.bodySmall
                    }}
                >
                    {EmailVerificationScreenResources?.instructionMessage}{" "}
                    <strong style={{ color: colors.primaryDark }}>{COMPANY_DATA.shortName}</strong>
                </p>
            </div>

            <form onSubmit={model.submit} className="flex w-full flex-col gap-5 px-5 flex-1">
                {/* Registration Response Message (from previous step) */}
                {hasRegistrationMessage && !hasError && !hasSuccess && (
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg" style={{ backgroundColor: colors.primaryLight }}>
                        <span style={{ color: colors.primary, ...typography.bodySmall, fontWeight: "500" }}>
                            {registrationMessage}
                        </span>
                    </div>
                )}

                {/* Error Message */}
                {hasError && (
                    <Error style={{ color: colors.red }} message={responseMessage} />
                )}

                {/* Success Message */}
                {hasSuccess && (
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg" style={{ backgroundColor: colors.successLight }}>
                        <span style={{ color: colors.success, ...typography.bodySmall, fontWeight: "500" }}>
                            ✓ {successMessage || "Verified! Redirecting..."}
                        </span>
                    </div>
                )}

                {/* Email Input */}
                <CustomerInput<VerifyUserMutationBody>
                    label={EmailVerificationScreenResources?.email?.label}
                    id={EmailVerificationScreenResources?.email?.id}
                    onChange={model.onChange}
                    type="email"
                    value={state?.userData?.email}
                    error={state?.errors}
                    disabled={EmailVerificationScreenResources?.email?.disabled}
                />

                {/* OTP Input */}
                <CustomerInput<VerifyUserMutationBody>
                    id={EmailVerificationScreenResources?.otp?.id}
                    label={EmailVerificationScreenResources?.otp?.label}
                    value={state?.userData?.otp}
                    error={state?.errors}
                    onChange={model.onChange}
                    type="text"
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
                        {EmailVerificationScreenResources?.loginLink?.label}
                        <Link
                            to={EmailVerificationScreenResources?.loginLink?.path}
                            className="px-1 underline hover:opacity-80 transition-opacity"
                            style={{
                                color: colors.primary,
                                fontWeight: typography.label.fontWeight
                            }}
                        >
                            {EmailVerificationScreenResources?.loginLink?.linkLabel}
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
});

EmailVerification.displayName = "EmailVerification";

export default EmailVerification;
