'use client'
import {type FC, type MouseEvent, useState} from "react";
import {Link} from "react-router";
import { blue_primary} from "~/resources/colors/colors";
import {Spinner} from "~/components/ui/spinner";
import {isNotBlank} from "~/utils/CompanionObjects";


interface FormButtonProps {
    label: string;
    style?:string;
    disabled:boolean;
    handleClick?:  (event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => void; // Function to handle the button click,
    type:"button" | "submit"

}



export function FormButton({ label, handleClick, style , disabled,type}: FormButtonProps) {

    const classname = isNotBlank<String>(style)?style:'w-full text-center text-black p-4 rounded-xl';

    handleClick = handleClick===undefined?(e)=>{console.debug(`submitted , id ${e.target}`)}
        :handleClick

    return (
        <button
            disabled={disabled}
            onClick={e=>handleClick(e)}
            className={classname}
            type={type}
            style={{backgroundColor:`${blue_primary}`}}
        >
            {label}
        </button>
    );
}


interface LinkButtonProps{
    label:string,
    path:string,
    style?:string,
    backgroundColor?:string
    borderColor?:string,
}

export function LinkButton({label, path, style, backgroundColor,borderColor}:LinkButtonProps){

    const classname = isNotBlank<String>(style)?style: 'w-full text-center text-black p-4 rounded-xl';

    return (
        <Link

            to={path}
            className={ classname}
            style={{backgroundColor:`${backgroundColor}`, borderColor:`${borderColor}`}}
        >
            {label}
        </Link>
    )
}

export function ResendCodeButton(){

    const [loading, setLoading] = useState(false);

    const handleClick = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 500)
    }

    return (
        <>
            {
                loading? (<Spinner/>) :
                (<button onClick={handleClick} className="px-1 font-medium hover:underline">Resend.</button>)
            }
        </>
    )
}



interface ToggleButtonProps {
    onToggle?: (state: boolean) => void; // Optional callback function triggered on toggle
    initialState?: boolean; // Initial state of the toggle button
}

const ToggleButton: FC<ToggleButtonProps> = ({
                                                       onToggle,
                                                       initialState = false,
                                                   }) => {


    const [isToggled, setIsToggled] = useState<boolean>(initialState);

    const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault(); // Prevents the default form submission or other actions
        const newState = !isToggled;
        setIsToggled(newState);
        if (onToggle) {
            onToggle(newState);
        }
    };

    return (
        <button
            onClick={handleToggle}
            type="button" // Explicitly setting the button type to avoid implicit "submit" behavior
            className={`w-12 h-6 flex items-center rounded-full p-0.5 ${
                isToggled ? "bg-blue-500" : "bg-[#787880] bg-opacity-25"
            } transition-colors duration-300`}
        >
            <div
                className={`w-6 h-6 bg-white rounded-full shadow-md transform ${
                    isToggled ? "translate-x-6" : "translate-x-0"
                } transition-transform duration-300`}
            ></div>
        </button>
    );
};

export default ToggleButton;






