import React, { useEffect, useState } from "react"
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from "react-router-dom";
import MemberCard from "../../components/MemberCard/membercard";
import { getMonthyJoined, threeDayExpire, fourToSevenDaysExpire, expired, inActiveMembers } from "./data";
import { toast } from 'react-toastify';

const GeneralUser = () => {
    const [header, setHeader] = useState("");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const func = sessionStorage.getItem('func');
        if (func) {
            functionCall(func);
        } else {
            setHeader("No Data Available");
            setLoading(false);
        }
    }, []);

    const functionCall = async (func) => {
        try {
            setLoading(true);
            let response;

            switch (func) {
                case "monthlyJoined":
                    setHeader("Monthly Joined Members");
                    response = await getMonthyJoined();
                    break;

                case "threeDayExpire":
                    setHeader("Expiring In 3 Days Members");
                    response = await threeDayExpire();
                    break;

                case "fourToSevenDaysExpire":
                    setHeader("Expiring In 4-7 Days");
                    response = await fourToSevenDaysExpire();
                    break;

                case "expired":
                    setHeader("Expired Members");
                    response = await expired();
                    break;

                case "inActiveMembers":
                    setHeader("InActive Members");
                    response = await inActiveMembers();
                    break;

                default:
                    setHeader("No Data Available");
                    setData([]);
                    return;
            }

            if (response && response.members) {
                setData(response.members);
            } else {
                setData([]);
                toast.info("No members found");
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error("Failed to fetch member data");
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-black p-5 w-3/4 flex-col">
            <div className="border-2 bg-slate-900 flex justify-between w-full text-white rounded-lg p-3">
                <Link to={'/dashboard'} className="border-2 pl-3 pr-3 pt-1 pb-1 rounded-2xl cursor-pointer hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:text-black">
                    <ArrowBackIcon /> Back To Dashboard
                </Link>
            </div>

            <div className="mt-5 text-xl text-slate-900 font-semibold">
                {header}
            </div>

            <div className="bg-slate-100 p-5 mt-5 rounded-lg grid grid-cols-1 gap-2 md:grid-cols-3 overflow-x-auto h-[80%]">
                {loading ? (
                    <div className="col-span-3 text-center py-4">Loading...</div>
                ) : data.length > 0 ? (
                    data.map((item, index) => (
                        <MemberCard key={item._id || index} item={item} />
                    ))
                ) : (
                    <div className="col-span-3 text-center py-4">No members found</div>
                )}
            </div>
        </div>
    );
};

export default GeneralUser;