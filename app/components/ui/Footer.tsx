import React from 'react';
import {Link} from "react-router";

const Footer = () => {

    return (<div className=" flex flex-col md:justify-center md:items-center mt-auto sm:mt-0 sticky pb-4">
            <p className="text-center text-xs text-gray-400 px-1 ">
                By continuing, you agree to our
            </p>

            <div className="flex flex-row  text-center text-xs text-gray-400   gap-2">

                <Link to={"http://localhost:3000/"}
                      className="font-light  underline text-gray-300">Terms of Service</Link>
                <span> and </span>
                <Link to={"http://localhost:3000/"}
                      className="font-light  underline text-gray-300">Privacy Policy</Link>
            </div>
        </div>
    );
};

export default Footer;