import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CancelIcon from '@mui/icons-material/Cancel';
import { toast } from 'react-toastify';

const PaymentCancel = () => {
    const navigate = useNavigate();

    useEffect(() => {
        sessionStorage.removeItem('pendingMember');
        toast.error("Payment was cancelled");
        setTimeout(() => navigate('/member'), 2000);
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <CancelIcon sx={{ fontSize: 60 }} className="text-red-500" />
            <h1 className="mt-4 text-2xl font-bold">Payment Cancelled</h1>
            <p className="mt-2 text-gray-600">Your payment was not processed.</p>
        </div>
    );
};

export default PaymentCancel;