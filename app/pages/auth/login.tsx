import {FormButton} from "~/components/ui/buttons";
import {Link} from "react-router";
import {PasswordInput, CustomerInput} from "~/components/ui/inputs";
import {COMPANY_DATA, loginScreenResources} from "~/resources/label/auth-labels";
import {useLoginModel} from "~/model/auth/LoginViewModel";
import Error from "~/components/ui/error";
import type {LoginRequest} from "~/domain/auth/generated/model";
import { colors, typography } from "~/resources/colors/colors";
import Loader from "~/components/ui/loader";

export default function Login() {

    const {state, model} = useLoginModel();

    const formButtonLabel = (state?.isLoading) ? "Loading ..." : loginScreenResources?.loginButton?.label;
    const isFormButtonDisabled = loginScreenResources?.loginButton?.disabled || state?.isLoading;
    const isResponse = state.errors?.response?.isError || state?.response?.isSuccess;
    const responseStyle = { color: state.errors?.response?.isError ? colors.red : colors.success };
    const responseMessage = state.errors?.response?.message || state?.response?.data || "";
    const responseElement = isResponse && <Error style={responseStyle} message={responseMessage as string}></Error>;

    if (state?.isLoading) {
        return <Loader fullScreen message="Signing you in..." />;
    }

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
                        fontSize: typography.bodySmall.fontSize,
                        fontWeight: typography.bodySmall.fontWeight
                    }}
                >
                    {`${loginScreenResources?.instructionMessage}`}{" "}
                    <strong style={{ color: colors.primaryDark }}>{COMPANY_DATA.shortName}</strong>
                </p>
            </div>

            <form onSubmit={model.submit} className="flex w-full flex-col gap-5 px-5 flex-1">
                {responseElement}

                <CustomerInput<LoginRequest>
                    label={loginScreenResources?.email?.label}
                    id={loginScreenResources?.email?.id}
                    onChange={model.onChange}
                    type="email"
                    value={state?.userData?.email}
                    error={state?.errors}
                />
                <PasswordInput<LoginRequest>
                    id={loginScreenResources?.password?.id}
                    passwordVisibilityStatus={loginScreenResources?.password?.passwordVisibility}
                    label={loginScreenResources?.password?.label}
                    value={state?.userData?.password}
                    error={state?.errors}
                    onChange={model.onChange}
                />

                <div className="flex flex-col justify-center items-end px-1">
                    <Link
                        to={loginScreenResources?.forgotPasswordLink?.path}
                        className="underline"
                        style={{
                            color: colors.primary,
                            fontSize: typography.bodySmall.fontSize,
                            fontWeight: typography.label.fontWeight
                        }}
                    >
                        {`${loginScreenResources?.forgotPasswordLink?.label}`}
                    </Link>
                </div>

                <div className="flex flex-col gap-4">
                    <FormButton
                        type="submit"
                        disabled={isFormButtonDisabled}
                        label={formButtonLabel}
                        style="w-full text-center p-2 sm:p-4 lg:p-3 xl:p-3 rounded-lg"
                    />
                    <p
                        className="text-center"
                        style={{
                            color: colors.textSecondary,
                            fontSize: typography.bodySmall.fontSize,
                            fontWeight: typography.bodySmall.fontWeight
                        }}
                    >
                        {loginScreenResources?.registerLink?.label}
                        <Link
                            to={loginScreenResources?.registerLink?.path}
                            className="px-1 underline"
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
}