import type {UUID} from "node:crypto";
import axiosForPrivateApi from "~/lib/axios/axios-api";
import {axiosJSONContentDefaultInstance} from "~/lib/axios/default-axios";


type BranchLocatorApiRequest = {
    searchText: string,
}
export  const getBranchesFromBranchLocatorApiByArea= (data:BranchLocatorApiRequest)=>{
    const  API = `api/v1/location/branches?searchText=${data.searchText}`;
    return axiosJSONContentDefaultInstance
        .get(API)
}
