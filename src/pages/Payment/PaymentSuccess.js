import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const PaymentSuccess = () => {
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const completeTransaction = async () => {
            try {
                // Check for different types of pending transactions
                const pendingMember = JSON.parse(sessionStorage.getItem('pendingMember'));
                const pendingBatchMember = JSON.parse(sessionStorage.getItem('pendingBatchMember'));
                const pendingRenewal = JSON.parse(sessionStorage.getItem('pendingRenewal'));

                if (pendingMember) {
                    // Handle new member registration
                    await axios.post(
                        'https://gym-backend-3jbg.onrender.com/members/register-member',
                        pendingMember,
                        { withCredentials: true }
                    );
                    sessionStorage.removeItem('pendingMember');
                    setSuccessMessage('New member registration completed successfully!');
                    setTimeout(() => navigate('/member'), 2500);
                }
                else if (pendingBatchMember) {
                    // Handle batch member registration
                    await axios.post(
                        'https://gym-backend-3jbg.onrender.com/batches/add-members-to-batch',
                        pendingBatchMember,
                        { withCredentials: true }
                    );
                    sessionStorage.removeItem('pendingBatchMember');
                    setSuccessMessage('Member added to batch successfully!');
                    setTimeout(() => navigate(`/batch/${pendingBatchMember.batchId}`), 2500);
                }
                else if (pendingRenewal) {
                    // Handle membership renewal
                    await axios.put(
                        `https://gym-backend-3jbg.onrender.com/members/update-member-plan/${pendingRenewal.memberId}`,
                        { membership: pendingRenewal.membershipId },
                        { withCredentials: true }
                    );
                    sessionStorage.removeItem('pendingRenewal');
                    setSuccessMessage('Membership renewed successfully!');
                    setTimeout(() => navigate(`/member/${pendingRenewal.memberId}`), 2500);
                }
                else {
                    toast.error("No pending transaction found");
                    navigate('/dashboard');
                }

            } catch (error) {
                console.error('Transaction Error:', error);
                toast.error(error.response?.data?.message || "Failed to complete transaction");
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        completeTransaction();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <CircularProgress />
                <p className="mt-4 text-gray-600">Processing your transaction...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            <CheckCircleIcon sx={{ fontSize: 60 }} className="text-green-500" />
            <h1 className="mt-4 text-2xl font-bold">Payment Successful!</h1>
            <p className="mt-2 text-gray-600">{successMessage}</p>
        </div>
    );
};

export default PaymentSuccess;
