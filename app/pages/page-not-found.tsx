import React from 'react';
import {CONTACT_SUPPORT_TEAM_MESSAGE, PAGE_NOT_FOUND_MESSAGE} from "~/resourses/labels/auth/labels";

const PageNotFound = () => {
    return (
        <div className="flex flex-col justify-center items-center text-[#3A3A3A] font-mono  -tracking-wider gap-10">
            <p className={"w-full text-xl px-2"}>
                {PAGE_NOT_FOUND_MESSAGE}
            </p>
            <p className={"w-full text-1xl px-10"}>
                {CONTACT_SUPPORT_TEAM_MESSAGE}
            </p>
        </div>
    );
};

export default PageNotFound;