import {
    type ChangeEvent,
    type ChangeEventHandler,
    type MouseEvent,
    type RefObject,
    useReducer,
    useRef
} from "react";
import {Eye, EyeOff, Search} from "lucide-react";
import {isNotBlank,  PasswordVisibility} from "~/utils/CompanionObjects";
import type {TypeError} from "~/domain/error/Error";
import {colors} from "~/resources/colors/colors";

interface PasswordInputProps<T> {
    passwordVisibilityStatus?: PasswordVisibility,
    label: string,
    id: string,
    value?: string,
    error: TypeError<T>,
    onChange: ChangeEventHandler<HTMLInputElement>
}

interface Visibility {
    inputType: string,
    visible: boolean
}


export function PasswordInput<T>({
                                     label,
                                     passwordVisibilityStatus,
                                     id,
                                     value,
                                     error,
                                     onChange
                                 }: PasswordInputProps<T>) {


    const errorElement = error[id as keyof T];

    const {message, isError} = errorElement;

    const isVisible = passwordVisibilityStatus === PasswordVisibility.ALWAYS_VISIBLE
    const InputType = isVisible ? "text" : "password"
    const initialState: Visibility = {inputType: InputType, visible: isVisible}


    const [visibilityState, dispatchVisibility] = useReducer((prevState: Visibility, action: Visibility) => {
        return {...prevState, ...action}
    }, initialState);

    const toggleVisibility = passwordVisibilityStatus === PasswordVisibility.TOGGLE_VISIBILITY ;

    const handlePasswordVisibility = (event: MouseEvent<HTMLButtonElement>) => {

        event.preventDefault();
        if (toggleVisibility) {
            const visible = !visibilityState.visible;
            const inputType = visible ? "text" : "password";
            dispatchVisibility({visible: visible, inputType: inputType})
        }
    };
    const style = (isError) ?
        "flex relative justify-between p-3 bg-transparent border-b-1  border-red-600"
        : "flex  relative justify-between p-3 bg-transparent border-b-1  border-zinc-400  hover:border-red-200 focus:border-red-200";


    const customerStyle = isNotBlank<string>(style);

    const classStyle = customerStyle ? style : "flex flex-row border-0 w-full";


    const VisibilityButton = () => {
        return (
            toggleVisibility && <button type="button" onClick={handlePasswordVisibility}>
                {
                    (visibilityState.visible) ?
                        <Eye size="20" className="m-1 text-gray-400 hover:text-gray-400 focus:text-gray-400"/> :
                        <EyeOff size="20" className="m-1 text-gray-400 hover:text-gray-400 focus:text-gray-400"/>
                }
            </button>
        );
    }

    label = label ?? "Password";

    return (
        <div className={classStyle}>
            <input
                id={id}
                type={visibilityState.inputType}
                placeholder={label ?? "Password"}
                onChange={onChange}
                value={value}
                className="w-full bg-transparent outline-none focus:placeholder::text-blue-500 focus:text-[#1E313E] "
            />
            {
                (isError) &&
                <label htmlFor="outlined-input"
                       className="absolute left-3 transition-all duration-200 ease-in-out pointer-events-none -top-2.5 text-[.5rem]  px-1.5 text-red-500">
                    {message}
                </label>
            }


            <VisibilityButton/>
        </div>
    )
}


interface UnderlinedInputProps<T> {
    id: string,
    label: string,
    inputStyle?: string
    divStyle?: string
    type?: "text" | "email",
    value?: string,
    error: TypeError<T>,
    isMultiLine?: boolean,
    lines?: number,
    inputRef?: RefObject<HTMLInputElement | null>,
    onChange: ChangeEventHandler<HTMLInputElement|HTMLTextAreaElement>,
    disabled?: boolean,

}

export const CustomerInput = <T, >({
                                       id,
                                       type,
                                       value,
                                       label,
                                       error,
                                       inputStyle,
                                       divStyle,
                                       inputRef,
                                       onChange,
                                       isMultiLine,
                                       lines,
    disabled
                                   }: UnderlinedInputProps<T>) => {




    const errorElement = error[id as keyof TypeError<T>];
    const {message, isError} = errorElement;
    inputRef = inputRef===undefined?useRef<HTMLInputElement>(null):inputRef;
    isMultiLine = isMultiLine !== undefined;
    lines = (isMultiLine && lines===undefined)?3:lines;

    const  isDisabled = disabled === undefined?false:disabled;
    const handleChange = (e: ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
        const cursorPosition = e.target.selectionStart;
        onChange(e)
        setTimeout(() => {
            if (inputRef.current && cursorPosition !== null) {
                inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
            }
        }, 0);
    };


    type = isNotBlank<String>(type) ? type : "text"
    divStyle = isNotBlank<String>(divStyle) ? divStyle : "flex justify-between relative p-3 bg-transparent border-b-1  border-zinc-400  hover:border-red-200 focus:border-red-200"
    inputStyle = isNotBlank(inputStyle) ? inputStyle : "bg-transparent outline-none  focus:placeholder::text-bl-500 focus:text-[#1E313E] w-full "


    return (
        <div className={divStyle}>
            {isMultiLine?
                <textarea
                    ref={inputRef as unknown as RefObject<HTMLTextAreaElement>}
                    onChange={handleChange}
                    id={id}
                    placeholder={label}
                    value={value}
                    rows={lines}
                    className={inputStyle}
                    disabled={isDisabled}
                />
                :<input   key={id} ref={inputRef} onChange={handleChange} id={id} type={type} placeholder={label} value={value}
                   className={inputStyle} disabled={isDisabled} />
            }
            {
                isError &&
                <label htmlFor="outlined-input"
                       className="absolute left-3 transition-all duration-200 ease-in-out pointer-events-none -top-2.5 text-[0.5rem]  px-1.5 text-red-500">
                    {message}
                </label>
            }
        </div>
    );
};

type  SearchInputProps<T> ={
    id: string,
    label: string,
    inputStyle?: string
    error: TypeError<T>,
    divStyle?: string
    value?: string,
    inputRef?: RefObject<HTMLInputElement | null>,
    onChange: ChangeEventHandler<HTMLInputElement|HTMLTextAreaElement>,
}
export const CustomerSearchInput =<T,> ({
                                       id,
                                       value,
                                       label,
                                       inputStyle,
                                       divStyle,
                                       inputRef,
                                       onChange,
                                        error
                                   } :SearchInputProps<T> ) =>{



    const errorElement = error[id as keyof TypeError<T>];
    const {message, isError} = errorElement;

    inputRef = inputRef===undefined?useRef<HTMLInputElement>(null):inputRef;

    const handleChange = (e: ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
        const cursorPosition = e.target.selectionStart;
        onChange(e)
        setTimeout(() => {
            if (inputRef.current && cursorPosition !== null) {
                inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
            }
        }, 0);
    };


    divStyle = isNotBlank<String>(divStyle) ? divStyle : "relative flex items-center h-[48px] w-full pl-1 rounded-sm"
    inputStyle = isNotBlank(inputStyle) ? inputStyle : "bg-transparent outline-none w-full  py-2 text-sm p-0.5"


    return (
        <div
            className={divStyle}
            style={{
                color: colors.textSecondary,
                backgroundColor: colors.bgWhite,
                borderWidth: 1,
                borderColor: colors.borderMedium
            }}
        >
        {
            isError &&
            <label htmlFor="outlined-input"
                   className="absolute left-3 transition-all duration-200 ease-in-out pointer-events-none -top-2.5 text-[0.5rem]  px-1.5 text-red-500">
                {message}
            </label>
        }
            <input
                id={id}
                placeholder={label}
                value={value}
                className={inputStyle}
                type="text"
                onChange={handleChange}
            />
            <button type={"submit"} className="w-[10%] min-w-[40px] h-full flex
                            items-center justify-center transition-all duration-200 hover:brightness-110
                             active:scale-95 cursor-pointer shadow-[2px_0_5px_rgba(0,0,0,0.05)] "
                    style={{color: colors.white, borderColor: colors.textLight, backgroundColor: colors.primary}}>
                <Search
                    size={20} strokeWidth={2.5}
                    type={"submit"}
                    style={{color: colors.white}}
                />
            </button>

        </div>
    );
};




