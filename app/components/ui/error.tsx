import {type CSSProperties} from 'react';

type ErrorProps = {
    style:CSSProperties,
    message:string

}
const Error = ({style, message}:ErrorProps) => {
    return (
        <div className="text-center text-sm w-full  " style={style} >
            <p>
                {message}
            </p>
        </div>
    );
};

export default Error;