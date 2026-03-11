import {type Dispatch, type MouseEvent, useMemo, useReducer, useState} from "react";
import {DayOfWeek} from "~/utils/CompanionObjects";
import {ViewModel} from "~/model/ViewModel";
import {
    type BranchItem, BranchItemSchema,
    type BranchItemState,
} from "~/domain/branch-locator/BranchLocator";
import {type ActionDispatch, ActionEvent} from "~/model/ActionEvent";
import {type NavigateFunction, useNavigate} from "react-router";
import {createZodResolver} from "~/model/auth/zod/ZodResolver";
import type {TypeError} from "~/domain/error/Error";



const branchItemInitState:BranchItemState ={
    errors: {
        response: {
            isError: false
        },
        branchId: {
            isError: false
        },
        viewedBranch: {
            isError: false
        },
        viewStatus: {
            isError: false
        }
    },
    isLoading: false,
    userData: {
        branchId: "",
        viewedBranch: "",
        viewStatus: false
    }

}
type HaveSlotBookedInFutureProp={
    haveSlotBookedInFuture:boolean
}
export const useBranchItemModelView = ({haveSlotBookedInFuture}:HaveSlotBookedInFutureProp) => {

    const reducer = ViewModel.reducer<BranchItem,string,BranchItemState>(branchItemInitState);

     const[state,dispatch] = useReducer(reducer, branchItemInitState);

     const navigateFunction = useNavigate();



    const resolver = useMemo(() => createZodResolver<BranchItem, TypeError<BranchItem>>(BranchItemSchema), []);

    const model = useMemo(()=>new BranchItemModelView(state,dispatch,resolver,navigateFunction,haveSlotBookedInFuture),[state,resolver] );

    return {state,model}

};

export class BranchItemModelView extends  ViewModel<BranchItem, string, BranchItemState>{

    constructor(
        protected state: BranchItemState,
        protected dispatch: Dispatch<ActionDispatch<BranchItem, string>>,
        protected resolver:  (data: BranchItem) => Promise<{ errors?: TypeError<BranchItem>; values?: BranchItem; }>,
        protected  navigateFunction: NavigateFunction,
        private haveSlotBookedInFuture:boolean
    ) {
        super(state,dispatch,resolver, branchItemInitState);
    }


    onView = async ( id:string|boolean,value:string, event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const field = id as keyof BranchItem;
        this.dispatch({type: ActionEvent.SET_FIELD, data:{...this.state.userData,[field]:value, viewStatus:!this.state.userData.viewStatus,}});
    }

    onBook = async (branchId:string,branchName:string ,distance:string, event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        this.navigateFunction(`${branchId}/slots`, {replace:false, state:{branchName:branchName, distance:distance,haveSlotBookedInFuture:this.haveSlotBookedInFuture}});
    }

    static getDayName = (date: string) => {
        const day = new Date(date).getDay();
        return DayOfWeek[day];
    }

    static getHourMinutesFormat = (date: string) => {
        const regex = /^(\d{2}):(\d{2})/;
        const match = date.match(regex);
        if (!match) return date;
        const hour = match[1].replaceAll("-", ":");
        const minutes = match[2].replaceAll("-", ":");
        return `${hour}:${minutes}`
    }

    static sort = (a: string, b: string) => {
        return Date.parse(a) - Date.parse(b)
    }

}


