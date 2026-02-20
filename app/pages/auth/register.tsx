import { memo } from "react";
import { Link } from "react-router";
import { PasswordInput, CustomerInput } from "~/components/ui/inputs";
import NBIcon from "~/components/ui/NBIcon";
import { useRegisterModel } from "~/model/auth/RegisterViewModel";
import { registerScreenResources } from "~/resources/label/auth-labels";
import Error from "~/components/ui/error";
import type { NewUserRequest } from "~/domain/user/generated/model";
import CustomerCheckBox from "~/components/ui/check-box";
import { colors, typography } from "~/resources/colors/colors";
import { PrimaryButton } from "~/components/ui/buttons";

const Register = memo(() => {
    const { state, model } = useRegisterModel();

    // Derived state
    const isLoading = state?.isLoading;
    const formButtonLabel = isLoading ? "Creating account..." : registerScreenResources?.registerButton?.label;
    const isFormButtonDisabled = registerScreenResources?.registerButton?.disabled || isLoading;

    // Response handling
    const hasError = state.errors?.response?.isError;
    const hasSuccess = state?.response?.isSuccess;
    const responseMessage = state.errors?.response?.message || "";

    return (
        <div
            className="flex flex-col items-center justify-center gap-4 w-full max-w-sm p-4 sm:max-w-lg md:max-w-xl lg:max-w-lg lg:gap-2"
            style={{ backgroundColor: colors.bgWhite }}
        >
            <div className="flex flex-col gap-10">
                <div className="flex flex-col items-center py-3">
                    <img
                        src={registerScreenResources?.companyLogo}
                        alt="Capitec"
                        width={100}
                        height={100}
                        className="-mb-12"
                    />
                </div>

                <div className="flex flex-col py-3">
                    <div className="flex flex-col items-center">
                        <h1
                            style={{
                                color: colors.primary,
                                ...typography.h4
                            }}
                        >
                            {registerScreenResources?.headerInstruction}
                        </h1>
                    </div>
                    <div className="flex flex-row items-center gap-1 -mt-5">
                        <div className="flex flex-row items-center w-8 sm:w-9">
                            <NBIcon size={120} />
                        </div>
                        <p
                            className="text-xs sm:text-sm lg:text-sm"
                            style={{
                                color: colors.primaryDark,
                                ...typography.body
                            }}
                        >
                            {registerScreenResources?.subHeaderInstruction?.message}
                        </p>
                    </div>
                </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={e => model.submit(e)} className="flex w-full flex-col gap-5 px-10 flex-1">
                {/* Error/Success Message - Inline */}
                {hasError && (
                    <Error style={{ color: colors.red }} message={responseMessage} />
                )}

                {hasSuccess && (
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg" style={{ backgroundColor: colors.successLight }}>
                        <span style={{ color: colors.success, ...typography.bodySmall, fontWeight: "500" }}>
                            ✓ Account created! Redirecting to email verification...
                        </span>
                    </div>
                )}

                <div className="flex flex-col gap-2.5">
                    <CustomerCheckBox
                        isChecked={state.userData?.isCapitecClient!}
                        onToggle={() => model.onToggle(`isCapitecClient`)}
                        label={registerScreenResources?.isCapitecClient?.label}
                    />
                    <CustomerInput<NewUserRequest>
                        id={registerScreenResources?.idNumber?.id}
                        label={registerScreenResources?.idNumber?.label}
                        value={state.userData?.idNumber}
                        error={state?.errors}
                        type="text"
                        onChange={model.onChange}
                    />
                    <CustomerInput<NewUserRequest>
                        id={registerScreenResources?.firstname?.id}
                        label={registerScreenResources?.firstname?.label}
                        value={state.userData?.firstname}
                        error={state?.errors}
                        type="text"
                        onChange={model.onChange}
                    />
                    <CustomerInput<NewUserRequest>
                        id={registerScreenResources?.lastname?.id}
                        label={registerScreenResources?.lastname?.label}
                        value={state?.userData?.lastname}
                        error={state.errors}
                        type="text"
                        onChange={model.onChange}
                    />
                    <CustomerInput<NewUserRequest>
                        id={registerScreenResources?.email?.id}
                        type="email"
                        label={registerScreenResources?.email?.label}
                        value={state?.userData.email}
                        error={state?.errors}
                        onChange={model.onChange}
                    />
                    <PasswordInput<NewUserRequest>
                        label={registerScreenResources?.password?.label}
                        id={registerScreenResources?.password?.id}
                        passwordVisibilityStatus={registerScreenResources?.password?.passwordVisibility}
                        value={state?.userData?.password}
                        error={state?.errors}
                        onChange={model.onChange}
                    />
                    <PasswordInput<NewUserRequest>
                        id={registerScreenResources?.confirmPassword?.id}
                        label={registerScreenResources?.confirmPassword?.label}
                        passwordVisibilityStatus={registerScreenResources?.confirmPassword?.passwordVisibility}
                        value={state?.userData?.confirmPassword}
                        error={state?.errors}
                        onChange={model.onChange}
                    />
                </div>

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
                        {registerScreenResources?.loginLinkButton?.label}
                        <Link
                            to={registerScreenResources?.loginLinkButton?.path}
                            className="px-1 underline hover:opacity-80 transition-opacity"
                            style={{
                                color: colors.primary,
                                fontWeight: typography.label.fontWeight
                            }}
                        >
                            {registerScreenResources?.loginLinkButton?.linkLabel}
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
});

Register.displayName = "Register";

export default Register;
