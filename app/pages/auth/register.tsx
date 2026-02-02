import {Link} from "react-router";
import {FormButton} from "~/components/ui/buttons";
import {PasswordInput, CustomerInput} from "~/components/ui/inputs";
import NBIcon from "~/components/ui/NBIcon";
import {useRegisterModel} from "~/model/auth/RegisterViewModel";
import {registerScreenResources} from "~/resources/label/auth-labels";
import Error from "~/components/ui/error";
import type {NewUserRequest} from "~/domain/user/generated/model";
import CustomerCheckBox from "~/components/ui/check-box";
import { colors, typography } from "~/resources/colors/colors";
import Loader from "~/components/ui/loader";

export default function register() {

    const { state, model } = useRegisterModel();

    const formButtonLabel = (state?.isLoading)?"Loading ...":registerScreenResources?.registerButton?.label;
    const isFormButtonDisabled = registerScreenResources?.registerButton?.disabled || state?.isLoading;
    const isResponse = state.errors?.response?.isError || state?.response?.isSuccess;
    const responseStyle = { color: state.errors?.response?.isError ? colors.red : colors.success };
    const responseMessage = state.errors?.response?.message || state?.response?.data || "";
    const responseElement = isResponse && <Error style={responseStyle} message={responseMessage}></Error>;

    if (state?.isLoading) {
        return <Loader fullScreen message="Creating your account..." />;
    }

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
                                fontSize: typography.h4.fontSize,
                                fontWeight: typography.h4.fontWeight
                            }}
                        >
                            {registerScreenResources?.headerInstruction}
                        </h1>
                    </div>
                    <div className="flex flex-row items-center gap-1 -mt-5">
                        <div className="flex flex-row items-center w-8 sm:w-9">
                            <NBIcon size={120}/>
                        </div>
                        <p
                            className="text-xs sm:text-sm lg:text-sm"
                            style={{
                                color: colors.primaryDark,
                                fontWeight: typography.body.fontWeight
                            }}
                        >
                            {registerScreenResources?.subHeaderInstruction?.message}
                        </p>
                    </div>
                </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={e => model.submit(e)} className="flex w-full flex-col gap-5 px-10 flex-1">
                {responseElement}

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

                <div className="flex flex-col gap-4">
                    <FormButton
                        label={formButtonLabel}
                        disabled={isFormButtonDisabled}
                        type={"submit"}
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
                        {registerScreenResources?.loginLinkButton?.label}
                        <Link
                            to={registerScreenResources?.loginLinkButton?.path}
                            className="px-1 underline"
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
}