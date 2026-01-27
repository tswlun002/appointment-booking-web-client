import {Outlet} from "react-router";

import {white_background} from "~/resourses/colors/colors";

export default function AuthLayout() {

    return (
            <main className="flex flex-col items-center justify-center min-h-screen w-full"
                  style={{backgroundColor: `${white_background}`}}>
                <Outlet/>
            </main>
    )
}