import React, { useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';

const stripePromise = loadStripe('pk_test_51RLkPGQewoVc3PzjZWCtow2VaH7rJj9SVoiQXajish5JeMsR2zhMxQg2RA96bTJTz3bUqHOVqAV2pW5gQRpnoK0V00YvwKozhN');

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const initiatePayment = async () => {
            try {
                const { memberData, amount } = location.state;
                
                if (!memberData || !amount) {
                    toast.error("Payment information missing");
                    navigate('/member');
                    return;
                }

                const stripe = await stripePromise;
                
                const response = await axios.post(
                    'https://gym-backend-3jbg.onrender.com/payment/create-session',
                    {
                        memberData,
                        amount,
                        type: 'membership'
                    },
                    { withCredentials: true }
                );

                if (response.data.sessionId) {
                    const result = await stripe.redirectToCheckout({
                        sessionId: response.data.sessionId
                    });

                    if (result.error) {
                        throw new Error(result.error.message);
                    }
                }
            } catch (error) {
                console.error('Payment Error:', error);
                toast.error("Payment initialization failed");
                navigate('/member');
            }
        };

        initiatePayment();
    }, [location, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <CircularProgress />
            <p className="mt-4 text-lg">Initializing payment...</p>
        </div>
    );
};

export default Payment;