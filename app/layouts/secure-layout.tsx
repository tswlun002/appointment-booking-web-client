
import {Outlet} from "react-router";
import {useSecuredLayoutModel} from "~/model/layout/SecuredLayoutViewModel";


export default function SecuredLayout() {

    const hasAccess = useSecuredLayoutModel();
    const element = hasAccess&&<Outlet/>
    console.log(hasAccess);
    return (<>{element}</>)
}