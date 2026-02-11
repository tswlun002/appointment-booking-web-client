import { memo } from "react";
import { Link } from "react-router";
import { PasswordInput, CustomerInput } from "~/components/ui/inputs";
import { COMPANY_DATA, loginScreenResources } from "~/resources/label/auth-labels";
import { useLoginModel } from "~/model/auth/LoginViewModel";
import Error from "~/components/ui/error";
import type { LoginRequest } from "~/domain/auth/generated/model";
import { colors, typography } from "~/resources/colors/colors";
import { Spinner } from "~/components/ui/spinner";

const Login = memo(() => {
    const { state, model } = useLoginModel();

    // Derived state
    const isLoading = state?.isLoading;
    const formButtonLabel = isLoading ? "Signing in..." : loginScreenResources?.loginButton?.label;
    const isFormButtonDisabled = loginScreenResources?.loginButton?.disabled || isLoading;

    // Response handling
    const hasError = state.errors?.response?.isError;
    const hasSuccess = state?.response?.isSuccess;
    const responseMessage = state.errors?.response?.message || "";

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
                    {loginScreenResources?.instructionMessage}{" "}
                    <strong style={{ color: colors.primaryDark }}>{COMPANY_DATA.shortName}</strong>
                </p>
            </div>

            <form onSubmit={model.submit} className="flex w-full flex-col gap-5 px-5 flex-1">
                {/* Error/Success Message - Inline */}
                {hasError && (
                    <Error style={{ color: colors.red }} message={responseMessage} />
                )}

                {hasSuccess && (
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg" style={{ backgroundColor: colors.successLight }}>
                        <span style={{ color: colors.success, ...typography.bodySmall, fontWeight: "500" }}>
                            ✓ Successfully signed in. Redirecting...
                        </span>
                    </div>
                )}

                {/* Email Input */}
                <CustomerInput<LoginRequest>
                    label={loginScreenResources?.email?.label}
                    id={loginScreenResources?.email?.id}
                    onChange={model.onChange}
                    type="email"
                    value={state?.userData?.email}
                    error={state?.errors}
                />

                {/* Password Input */}
                <PasswordInput<LoginRequest>
                    id={loginScreenResources?.password?.id}
                    passwordVisibilityStatus={loginScreenResources?.password?.passwordVisibility}
                    label={loginScreenResources?.password?.label}
                    value={state?.userData?.password}
                    error={state?.errors}
                    onChange={model.onChange}
                />

                {/* Forgot Password Link */}
                <div className="flex flex-col justify-center items-end px-1">
                    <Link
                        to={loginScreenResources?.forgotPasswordLink?.path}
                        className="underline hover:opacity-80 transition-opacity"
                        style={{
                            color: colors.primary,
                            ...typography.bodySmall,
                            fontWeight: typography.label.fontWeight
                        }}
                    >
                        {loginScreenResources?.forgotPasswordLink?.label}
                    </Link>
                </div>

                {/* Submit Button & Register Link */}
                <div className="flex flex-col gap-4">
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
                        {loginScreenResources?.registerLink?.label}
                        <Link
                            to={loginScreenResources?.registerLink?.path}
                            className="px-1 underline hover:opacity-80 transition-opacity"
                            style={{
                                color: colors.primary,
                                fontWeight: typography.label.fontWeight
                            }}
                        >
                            {loginScreenResources?.registerLink?.linkLabel}
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
});

Login.displayName = "Login";

export default Login;
