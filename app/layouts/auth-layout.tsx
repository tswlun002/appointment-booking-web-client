import {Outlet} from "react-router";

import {white_background} from "~/resources/colors/colors";
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient} from "~/lib/react-query/Client";

export default function AuthLayout() {

    return (
        <QueryClientProvider client={queryClient}>
            <main className="flex flex-col items-center justify-center min-h-screen w-full"
                  style={{backgroundColor: `${white_background}`}}>
                <Outlet/>
            </main>
        </QueryClientProvider>
    )
}