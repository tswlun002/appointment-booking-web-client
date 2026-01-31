import React, {useEffect, useState} from 'react';
import type {BranchLocation} from "~/domain/branch-locator/generated/model";

type InitialState = BranchLocation[]
const initialState:InitialState = []
function Branches() {
     let [state, set] = useState(initialState);
     useEffect(() => {
         fetch('http://127.0.0.1:57610/api/v1/branches/search', {method: 'GET'})
             .then(res => res.json())
             .then(data => set(initialState=>[...initialState, ...data]))
             .catch(err => console.log(err));
     }, [])

    return (

        <div >
            <ul>{
                state.map((branch, idx)=><li className="p-5" key={idx}>{JSON.stringify(branch)}</li>)
            }
            </ul>
        </div>
    );
}

export default Branches;
