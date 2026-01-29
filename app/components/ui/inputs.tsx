'use client'
import {
    type ChangeEvent,
    type ChangeEventHandler,
    type MouseEvent,
    type RefObject,
    useReducer,
    useRef
} from "react";
import {Eye, EyeOff} from "lucide-react";
import {isNotBlank,  PasswordVisibility} from "~/utils/CompanionObjects";
import type {TypeError} from "~/domain/error/Error";

interface PasswordInputProps<T> {
    passwordVisibilityStatus?: PasswordVisibility,
    label: string,
    style?: string,
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
                                     style,
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
    onChange: ChangeEventHandler<HTMLInputElement|HTMLTextAreaElement>

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
                                   }: UnderlinedInputProps<T>) => {




    const errorElement = error[id as keyof TypeError<T>];
    const {message, isError} = errorElement;
    inputRef = inputRef===undefined?useRef<HTMLInputElement>(null):inputRef;
    isMultiLine = isMultiLine !== undefined;
    lines = (isMultiLine && lines===undefined)?3:lines;

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
    inputStyle = isNotBlank(inputStyle) ? inputStyle : "bg-transparent outline-none  focus:placeholder::text-blues-500 focus:text-[#1E313E] w-full "


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
                />
                :<input  key={id} ref={inputRef} onChange={handleChange} id={id} type={type} placeholder={label} value={value}
                   className={inputStyle}/>
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





