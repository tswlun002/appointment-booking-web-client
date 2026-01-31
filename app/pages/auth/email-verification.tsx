import {FormButton} from "~/components/ui/buttons";
import {Link} from "react-router";
import { CustomerInput} from "~/components/ui/inputs";
import {useEmailVerificationModel} from "~/model/auth/EmailVerificationViewModel";
import {COMPANY_DATA, EmailVerificationScreenResources} from "~/resources/auth/labels";
import Error from "~/components/ui/error";
import type {VerifyUserMutationBody} from "~/api/user/generated/endpoints/registration/registration";

export default   function EmailVerification(){

    const {state, model} =useEmailVerificationModel();

    const formButtonLabel = state?.isLoading?"Loading ...":EmailVerificationScreenResources?.emailVerificationButton.label;
    const isFormButtonDisabled = EmailVerificationScreenResources?.emailVerificationButton?.disabled || state?.isLoading;
    const isResponse = state.errors?.response?.isError || state?.response?.isSuccess;
    const responseStyle = {color:state.errors?.response?.isError?"var(--color-red-600)":"var(--color-green-600)"};
    const responseMessage= state.errors?.response?.message|| state.response?.data as string || "";
    const errorElement  =  isResponse&&<Error style={responseStyle} message={responseMessage}></Error>


    return(
        <div className='flex flex-col items-center justify-center gap-4  w-full max-w-sm  p-4  sm:text-2xl sm:max-w-lg
        md:text-3xl md:max-w-xl  lg:text-xl lg:max-w-lg lg:gap-2'>

            {/* Registration Form */}
            <div className="flex flex-col gap-10">
                <div className="flex flex-col items-center py-3">
                    <img
                        src="/capitec.svg"
                        alt="Capite logo"
                        width={100}
                        height={100}
                        className="-mb-12"
                    />
                </div>

                <p className="text-xs sm:text-lg md:text-xl lg:text-sm py-3 ">
                    {`${EmailVerificationScreenResources?.instructionMessage}`} <strong>{COMPANY_DATA.shortName}</strong>
                </p>
            </div>


            <form onSubmit={model.submit} className={'flex w-full flex-col gap-5 px-5 flex-1 sm:text-lg'}>
                {
                    errorElement
                }
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
                    <FormButton  type="submit" disabled={isFormButtonDisabled} label={formButtonLabel} style="w-full text-center text-black p-2 sm:p-4 lg:p-3  xl:p-3 rounded-lg"/>
                    <p className="text-xs sm:text-lg md:text-xl lg:text-sm text-center">
                        {EmailVerificationScreenResources?.loginLink?.label}
                        <Link to={EmailVerificationScreenResources?.loginLink?.path} className="px-1 font-medium underline sm:text-lg md:text-xl lg:text-sm  ">
                            {EmailVerificationScreenResources?.loginLink?.linkLabel}
                        </Link>
                    </p>
                </div>
            </form>

        </div>
    )
}