import {FormButton} from "~/components/ui/buttons";
import {Link} from "react-router";
import { CustomerInput} from "~/components/ui/inputs";
import {useEmailVerificationModel} from "~/model/auth/EmailVerificationViewModel";
import {COMPANY_DATA, EmailVerificationScreenResources} from "~/resources/label/auth-labels";
import Error from "~/components/ui/error";
import type {VerifyUserMutationBody} from "~/api/user/generated/endpoints/registration/registration";
import { colors, typography } from "~/resources/colors/colors";
import Loader from "~/components/ui/loader";

export default function EmailVerification() {

    const {state, model} = useEmailVerificationModel();

    const formButtonLabel = state?.isLoading ? "Loading ..." : EmailVerificationScreenResources?.emailVerificationButton.label;
    const isFormButtonDisabled = EmailVerificationScreenResources?.emailVerificationButton?.disabled || state?.isLoading;
    const isResponse = state.errors?.response?.isError || state?.response?.isSuccess || state.additionalData.isSuccess;
    const responseStyle = { color: state.errors?.response?.isError ? colors.red : colors.success };
    const responseMessage = state.errors?.response?.message || state.response?.data as string || state.additionalData.registrationResponseMessage || "";
    const errorElement = isResponse && <Error style={responseStyle} message={responseMessage}></Error>;

    if (state?.isLoading) {
        return <Loader fullScreen message="Verifying your email..." />;
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
                    {`${EmailVerificationScreenResources?.instructionMessage}`}{" "}
                    <strong style={{ color: colors.primaryDark }}>{COMPANY_DATA.shortName}</strong>
                </p>
            </div>

            <form onSubmit={model.submit} className="flex w-full flex-col gap-5 px-5 flex-1">
                {errorElement}

                <CustomerInput<VerifyUserMutationBody>
                    label={EmailVerificationScreenResources?.email?.label}
                    id={EmailVerificationScreenResources?.email?.id}
                    onChange={model.onChange}
                    type="email"
                    value={state?.userData?.email}
                    error={state?.errors}
                    disabled={EmailVerificationScreenResources?.email?.disabled}
                />
                <CustomerInput<VerifyUserMutationBody>
                    id={EmailVerificationScreenResources?.otp?.id}
                    label={EmailVerificationScreenResources?.otp?.label}
                    value={state?.userData?.otp}
                    error={state?.errors}
                    onChange={model.onChange}
                    type="text"
                />

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
                        {EmailVerificationScreenResources?.loginLink?.label}
                        <Link
                            to={EmailVerificationScreenResources?.loginLink?.path}
                            className="px-1 underline"
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
}