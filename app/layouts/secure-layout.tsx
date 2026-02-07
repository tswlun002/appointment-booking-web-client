import { Outlet } from "react-router";
import { useSecuredLayoutModel } from "~/model/layout/SecuredLayoutViewModel";
import Loader from "~/components/ui/loader";
import SecuredHeader from "~/components/ui/SecuredHeader";


export default function SecuredLayout() {

    const { isAuthenticated, isLoading } = useSecuredLayoutModel();

    // Show loader while hydrating OR while redirecting (prevents flash of content)
    if (isLoading || !isAuthenticated) {
        return <Loader fullScreen message={isLoading ? "Loading..." : "Redirecting..."} />;
    }

    return (
        <div className="min-h-screen">
            <SecuredHeader />
            <main className="pt-14">
                <Outlet />
            </main>
        </div>
    );
}