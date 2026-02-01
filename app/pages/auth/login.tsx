import {FormButton} from "~/components/ui/buttons";
import {Link} from "react-router";
import {PasswordInput, CustomerInput} from "~/components/ui/inputs";
import {COMPANY_DATA, loginScreenResources} from "~/resources/auth/labels";
import {useLoginModel} from "~/model/auth/LoginViewModel";
import Error from "~/components/ui/error";
import type {LoginRequest} from "~/domain/auth/generated/model";

export default   function Login(){

    const {state, model} = useLoginModel();


    const formButtonLabel = (state?.isLoading)?"Loading ...":loginScreenResources?.loginButton?.label;
    const isFormButtonDisabled = loginScreenResources?.loginButton?.disabled || state?.isLoading;
    const isResponse = state.errors?.response?.isError || state?.response?.isSuccess;
    const responseStyle = {color:state.errors?.response?.isError?"var(--color-red-600)":"var(--color-green-600)"};
    const responseMessage =state.errors?.response?.message|| state?.response?.data ||""
    const responseElement  =  isResponse&&<Error style={responseStyle} message={responseMessage as string }></Error>

    return(
        <div className='flex flex-col items-center justify-center gap-4  w-full max-w-sm  p-4  sm:text-2xl sm:max-w-lg
        md:text-3xl md:max-w-xl  lg:text-xl lg:max-w-lg lg:gap-2'>

            {/* Registration Form */}
            <div className="flex flex-col gap-10">
                <div className="flex flex-col items-center py-3">
                    <img
                        src="/capitec.svg"
                        alt="Blocky 2 The World"
                        width={100}
                        height={100}
                        className="-mb-12"
                    />
                </div>

                <p className="text-xs sm:text-lg md:text-xl lg:text-sm py-3 ">
                    {`${loginScreenResources?.instructionMessage}`} <strong>{COMPANY_DATA.shortName}</strong>
                </p>
            </div>


            <form onSubmit={model.submit} className={'flex w-full flex-col gap-5 px-5 flex-1 sm:text-lg'}>

                {
                    responseElement
                }
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
                <div className={"flex flex-col justify-center-safe items-end text-xs underline text-shadow-white  px-1 sm:text-lg md:text-xl lg:text-sm "}>
                    <Link to={loginScreenResources?.forgotPasswordLink?.path}>{`${loginScreenResources?.forgotPasswordLink?.label}`}</Link>
                </div>

                <div className="flex flex-col gap-4">
                    <FormButton  type="submit" disabled={isFormButtonDisabled} label={formButtonLabel} style="w-full text-center text-white p-2 sm:p-4 lg:p-3  xl:p-3 rounded-lg"/>
                    <p className="text-xs sm:text-lg md:text-xl lg:text-sm text-center">
                        {loginScreenResources?.registerLink?.label}
                        <Link to={loginScreenResources?.registerLink?.path} className="px-1 font-medium underline sm:text-lg md:text-xl lg:text-sm  ">
                            {loginScreenResources?.registerLink?.linkLabel}
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    )
}