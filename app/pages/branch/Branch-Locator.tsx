import React, { useState } from 'react';
import { Search } from 'lucide-react';


const BranchLocator = () => {

    const [searchText, setSearchText] = useState(false);
    const [showOperatingHours, setShowOperatingHours] = useState(false);
    return (
        <div className={"w-full min-h-screen border-2 border-pink-500 flex justify-center items-center "}>
            <div className={"flex items-center w-full justify-center"}>
                <div className={"w-3/4 h-180 rounded-md bg-[url('/branches/branch-wrapper.webp')] bg-cover bg-center bg-no-repeat flex "}>
                    <div className={"bg-[#ffffffd9] h-[230px] min-w-[544px] text-left rounded-sm px-5 mt-35 ml-10"}>
                        <h3 className={"text-3xl py-5"}>Find a branch</h3>
                        <form>
                            <button
                                type="button"
                                className={"flex items-center justify-center text-center border-[0.8px] border-[#2f70ef] text-[#2f70ef] bg-white rounded-full curser-pointer h-[48px] min-w-[144px] py-[14.5px] px-[24px] mb-4"}
                                onClick={() =>
                                    setSearchText(!searchText)
                                }
                            >Please enable your location settings
                            </button>
                            <div className={"text-[#3a3a3a] bg-white flex items-center h-[48px] w-[480px] mb-2 px-2 rounded-sm"}>
                                <input autoComplete="off" placeholder="Search for a branch name, city or province" type="text"
                                       name="branchSearchText" className="bg-white rounded-sm text-black outline-none w-full py-2"/>
                                <Search className=" h-5 w-5 text-[##3a3a3a]" />
                            </div>
                        </form>
                    </div>
                    {
                        searchText && (
                            <div className={"bg-white h-full w-full px-12 ml-55 border-b-[0.8px] border-[#3a3a3a2b]"}>
                                <div className={"flex flex-col gap-2 border-b-[0.8px] border-[#3a3a3a2b] py-4 "}>
                                    <div className={"flex justify-between gap-2"}>
                                        <button className={"flex items-center gap-2"} onClick={() => setShowOperatingHours(!showOperatingHours)}>
                                             <span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="46" height="24" viewBox="0 0 46 24">
                                                    <g fill="none" fill-rule="evenodd">
                                                        <path fill="#C83C37" d="M32.578 0H16.32v6.82c0 2.435 1.993 4.413 4.428 4.413h8.5c3.045 0 5.535 2.49 5.535 5.535v6.446c5.897-.975 10.413-5.779 10.413-11.516C45.196 5.264 39.518 0 32.578 0"/>
                                                        <path fill="#00466E" d="M25.85 12.188h-8.473c-3.045 0-5.535-2.453-5.535-5.497V.112C5.261.487 0 5.594 0 11.786c0 6.435 5.678 11.7 12.619 11.7h17.66v-6.87a4.44 4.44 0 0 0-4.428-4.428"/>
                                                    </g>
                                                </svg>
                                             </span>
                                            <p className={"font-semibold"}>Rondebosch</p>
                                        </button>

                                        <div className={"h-10 w-10 flex items-center justify-center"}>
                                                <img className={"object-cover w-full h-full"} src="/ui-elements/chevron-bottom-normal.svg" alt="down arrow"/>
                                        </div>
                                    </div>

                                    <p className={"flex items-center"}>
                                        Shop G21, Cnr Main & Belmont Road, Fountain Centre, Rondebosch, 7700
                                    </p>


                                    <p>Operating Hours</p>

                                    <ul>
                                        <li>Monday 26 Jan 2026: Closed </li>
                                        <li>Tuesday 27 Jan 2026: 08:00 am - 17:00 pm</li>
                                        <li>Wednesday 28 Jan: 08:00 am - 17:00 pm</li>
                                        <li>Thursday 29 Jan: Closed</li>
                                        <li>Friday 30 Jan: Closed</li>
                                        <li>Saturday 31 Jan: 08:00 am - 13:00 pm </li>
                                        <li>Sunday 1 Feb: Closed</li>
                                    </ul>

                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default BranchLocator;