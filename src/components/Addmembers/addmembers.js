import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import { loadStripe } from '@stripe/stripe-js';

import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';

const Addmembers = () => {
    const navigate = useNavigate();
    const [inputField, setInputField] = useState({
        name: "",
        mobileNo: "",
        membership: "",
        profilePic: "https://th.bing.com/th/id/OIP.gj6t3grz5no6UZ03uIluiwHaHa?rs=1&pid=ImgDetMain",
        joiningDate: "",
        address: ""
    });
    const [imageLoader, setImageLoader] = useState(false);
    const [membershipList, setMembershipList] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");

    const handleOnChange = (event, name) => {
        setInputField({ ...inputField, [name]: event.target.value });
    };

    const uploadImage = async (event) => {
        setImageLoader(true);
        const files = event.target.files;
        const data = new FormData();
        data.append('file', files[0]);
        data.append('upload_preset', 'gym-management');

        try {
            const response = await axios.post("https://api.cloudinary.com/v1_1/dspq6kj00/image/upload", data);
            setInputField({ ...inputField, profilePic: response.data.url });
        } catch (err) {
            toast.error("Image upload failed");
            console.error(err);
        } finally {
            setImageLoader(false);
        }
    };

    const fetchMembership = async () => {
        try {
            const response = await axios.get('https://gym-backend-3jbg.onrender.com/plans/get-membership', { withCredentials: true });
            const memberships = response.data.membership;
            if (memberships.length === 0) {
                return toast.error("No membership plans available");
            }
            setMembershipList(memberships);
            const defaultMembershipId = memberships[0]._id;
            setSelectedOption(defaultMembershipId);
            setInputField(prev => ({ ...prev, membership: defaultMembershipId }));
        } catch (err) {
            console.error(err);
            toast.error("Error fetching memberships");
        }
    };

    useEffect(() => {
        fetchMembership()
    }, []);

    const handleOnChangeSelect = (event) => {
        const value = event.target.value;
        setSelectedOption(value);
        setInputField({ ...inputField, membership: value });
    };

    const handleRegisterButton = async () => {
        const { name, mobileNo, membership, joiningDate, profilePic, address } = inputField;

        if (!name || !mobileNo || !membership || !joiningDate || !address) {
            toast.error("Please fill all required fields");
            return;
        }

        const selectedMembership = membershipList.find(m => m._id === membership);
        if (!selectedMembership) {
            return toast.error("Invalid membership selection");
        }

        sessionStorage.setItem('pendingMember', JSON.stringify({
            name, mobileNo, membership, joiningDate, profilePic, address
        }));

        try {
            const response = await axios.post('https://gym-backend-3jbg.onrender.com/payment/create-session', {
                amount: selectedMembership.price,
                type: 'membership',
                description: `${selectedMembership.months} Months Gym Membership`,
                metadata: {
                    memberName: name,
                    membershipId: membership,
                    membershipMonths: selectedMembership.months
                }
            }, { withCredentials: true });

            console.log("Stripe session response:", response.data);

            const stripe = await loadStripe('pk_test_51RLkPGQewoVc3PzjZWCtow2VaH7rJj9SVoiQXajish5JeMsR2zhMxQg2RA96bTJTz3bUqHOVqAV2pW5gQRpnoK0V00YvwKozhN');
            const { error } = await stripe.redirectToCheckout({ sessionId: response.data.sessionId });

            if (error) throw new Error(error.message);


        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Payment initialization failed");
        }
    };

    return (
        <div className="text-black p-6">
            <div className="grid gap-5 grid-cols-1 md:grid-cols-2 text-lg">
                <input value={inputField.name} onChange={(e) => handleOnChange(e, "name")} placeholder="Name" type="text" className="input-style" />
                <input value={inputField.mobileNo} onChange={(e) => handleOnChange(e, "mobileNo")} placeholder="Mobile No" type="text" className="input-style" />
                <input value={inputField.address} onChange={(e) => handleOnChange(e, "address")} placeholder="Address" type="text" className="input-style" />
                <input value={inputField.joiningDate} onChange={(e) => handleOnChange(e, "joiningDate")} type="date" className="input-style" />
                
                <select value={selectedOption} onChange={handleOnChangeSelect} className="input-style">
                    {membershipList.map((item, index) => (
                        <option key={index} value={item._id}>{item.months} Months Membership</option>
                    ))}
                </select>

                <input type="file" onChange={uploadImage} />

                <div className="w-[100px] h-[150px]">
                    <img src={inputField.profilePic} className="w-full h-full rounded-full" alt="Profile Preview" />
                    {imageLoader && (
                        <Stack sx={{ width: '100%' }} spacing={2}>
                            <LinearProgress color="secondary" />
                        </Stack>
                    )}
                </div>

                <div onClick={handleRegisterButton} className="cursor-pointer p-3 text-lg bg-slate-900 text-white rounded-xl w-28 h-14 text-center hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                    Pay Now
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Addmembers;