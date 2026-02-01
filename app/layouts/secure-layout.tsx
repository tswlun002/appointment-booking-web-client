
import {Outlet} from "react-router";
import {useSecuredLayoutModel} from "~/model/layout/SecuredLayoutViewModel";
import {Spinner} from "~/components/ui/spinner";


export default function SecuredLayout() {

    const {isAuthenticated,isLoading} = useSecuredLayoutModel();
    if (isLoading) {
        return <Spinner/>
    }

    if (!isAuthenticated) {
        console.log("not authorized");
        return null
    }

    return <Outlet />
}