import {Link} from "react-router";
import {FormButton} from "~/components/ui/buttons";
import {PasswordInput, CustomerInput} from "~/components/ui/inputs";
import NBIcon from "~/components/ui/NBIcon";
import {useRegisterModel} from "~/model/auth/RegisterViewModel";
import {registerScreenResources} from "~/resources/auth/labels";
import Error from "~/components/ui/error";
import type {NewUserRequest} from "~/domain/user/generated/model";

export default function register() {

    const { state, model } = useRegisterModel();

    const style = (state.errors.confirmPassword?.isError) ?
        "flex relative justify-between p-3 bg-transparent border-b-1  border-red-600"
        : "flex  relative justify-between p-3 bg-transparent border-b-1  border-zinc-400  hover:border-red-200 focus:border-red-200";
    const formButtonLabel = (state?.isLoading)?"Loading ...":registerScreenResources?.registerButton?.label;
    const isFormButtonDisabled = registerScreenResources?.registerButton?.disabled || state?.isLoading;
    const isResponse = state.errors?.response?.isError || state?.response?.isSuccess;
    const responseStyle = {color:state.errors?.response?.isError?"var(--color-red-600)":"var(--color-green-600)"};
    const responseMessage =state.errors?.response?.message|| state?.response?.data ||""
    const responseElement  =  isResponse&&<Error style={responseStyle} message={responseMessage}></Error>



    return (
        <div className='flex flex-col items-center justify-center gap-4  w-full max-w-sm  p-4  sm:text-2xl sm:max-w-lg
        md:text-3xl md:max-w-xl  lg:text-xl lg:max-w-lg lg:gap-2'>

            <div className="flex flex-col gap-10 ">
                <div className="flex flex-col items-center py-3">
                    <img
                        src={registerScreenResources?.companyLogo}
                        alt="Blocky 2 The World"
                        width={100}
                        height={100}
                        className="-mb-12"
                    />
                </div>

                <div className="flex flex-col py-3 ">
                    <div className="flex flex-col items-center font text-[#0033a0]">
                        <h1>{registerScreenResources?.headerInstruction}</h1>
                    </div>
                    <div className="flex flex-row items-center gap-1 -mt-5 ">
                        <div className="flex flex-row  items-center  w-8 sm:w-9">
                            <NBIcon size={120}/>
                        </div>
                        <div
                            className={"text-[.6rem] sm:text-sm md:text-xl lg:text-sm  font-light text-[#1E313E]"}>
                            {registerScreenResources?.subHeaderInstruction?.message}
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Form */}

            <form  onSubmit={e=>model.submit(e)} className={'flex w-full flex-col gap-5  px-10 flex-1 sm:text-lg '} >
                {
                    responseElement
                }
                <div className="flex flex-col gap-2.5">
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
                        style={style}
                        onChange={model.onChange}
                    />
                    <PasswordInput<NewUserRequest>
                        id={registerScreenResources?.confirmPassword?.id}
                        label={registerScreenResources?.confirmPassword?.label}
                        passwordVisibilityStatus={registerScreenResources?.confirmPassword?.passwordVisibility}
                        value={state?.userData?.confirmPassword}
                        error={state?.errors}
                        style={style}
                        onChange={model.onChange}
                    />

                </div>

                <div className="flex flex-col gap-4">

                    <FormButton
                        label={formButtonLabel}
                        disabled={isFormButtonDisabled}
                        type={"submit"}
                        style="w-full text-center text-white p-2 sm:p-4 lg:p-3  xl:p-3 rounded-lg"
                    />

                    <p className="text-xs text-center  md:text-xl lg:text-sm font-light ">
                        {registerScreenResources?.loginLinkButton?.label}
                        <Link to={registerScreenResources?.loginLinkButton?.path} className="px-1 font-medium underline">
                            {registerScreenResources?.loginLinkButton?.linkLabel}
                        </Link>
                    </p>
                </div>
            </form>
        </div>

    )
}