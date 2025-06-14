import React, { useState, useEffect } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import Switch from "react-switch";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  "pk_test_51RLkPGQewoVc3PzjZWCtow2VaH7rJj9SVoiQXajish5JeMsR2zhMxQg2RA96bTJTz3bUqHOVqAV2pW5gQRpnoK0V00YvwKozhN"
);

// Add this helper function at the top of your component
const formatDate = (date) => {
  if (!date) return "Not Set";
  return date.slice(0, 10).split("-").reverse().join("-");
};

const MemberDetail = () => {
  const [status, setStatus] = useState("Pending");
  const [renew, setRenew] = useState(false);
  const [membership, setMembership] = useState([]);
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const [planMember, setPlanMember] = useState("");
  const { id } = useParams();

  useEffect(() => {
    fetchData();
    fetchMembership();
  }, []);

  const fetchMembership = async () => {
    axios
      .get("https://gym-backend-3jbg.onrender.com/plans/get-membership", {
        withCredentials: true,
      })
      .then((response) => {
        setMembership(response.data.membership);
        setPlanMember(response.data.membership[0]._id);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something Went Wrong");
      });
  };

  const fetchData = async () => {
    await axios
      .get(`https://gym-backend-3jbg.onrender.com/members/get-member/${id}`, {
        withCredentials: true,
      })
      .then((response) => {
        console.log(response);
        setData(response.data.members);
        setStatus(response.data.members.status);
        toast.success(response.data.message);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something Went Wrong");
      });
  };

  const handleSwitchBtn = async () => {
    let statuss = status === "Active" ? "Pending" : "Active";
    await axios
      .post(
        `https://gym-backend-3jbg.onrender.com/members/change-status/${id}`,
        { status: statuss },
        { withCredentials: true }
      )
      .then((response) => {
        toast.success("Status Changed");
      })
      .catch((err) => {
        toast.error("Something Went Wrong");
        console.log(err);
      });
    setStatus(statuss);
  };

  const isDateInPast = (inputDate) => {
    const today = new Date(); //Get the current date
    const givenDate = new Date(inputDate); //Convert the input to a date object

    return givenDate < today; // Check the given date is before today
  };

  const handleOnChangeSelect = (event) => {
    let value = event.target.value;
    setPlanMember(value);
  };
  const handleRenewSaveBtn = async () => {
    try {
      const selectedMembership = membership.find((m) => m._id === planMember);
      if (!selectedMembership) {
        toast.error("Please select a membership plan");
        return;
      }

      // Store renewal data in session storage
      sessionStorage.setItem(
        "pendingRenewal",
        JSON.stringify({
          memberId: id,
          membershipId: planMember,
          memberName: data.name,
        })
      );

      // Create payment session
      const response = await axios.post(
        "https://gym-backend-3jbg.onrender.com/payment/create-session",
        {
          amount: selectedMembership.price,
          type: "renewal",
          description: `Membership Renewal: ${selectedMembership.months} Months`,
          metadata: {
            memberId: id,
            membershipId: planMember,
          },
        },
        { withCredentials: true }
      );
      const stripe = await loadStripe("pk_test_51RLkPGQewoVc3PzjZWCtow2VaH7rJj9SVoiQXajish5JeMsR2zhMxQg2RA96bTJTz3bUqHOVqAV2pW5gQRpnoK0V00YvwKozhN");

      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.sessionId,
      });
        if (error) {
            toast.error("Failed to redirect to payment");
        }
    } catch (err) {
      console.error(err);
      toast.error("Failed to process renewal");
    }
  };

  return (
    <div className="w-3/4 text-black p-5">
      <div
        onClick={() => {
          navigate(-1);
        }}
        className="border-2 w-fit text-xl font-sans text-white p-2 rounded-xl bg-slate-900 cursor-pointer"
      >
        <ArrowBackIcon /> Go Back
      </div>

      <div className="mt-10 p-2">
        <div className="w-[100%] h-fit flex">
          <div className="w-1/3 mx-auto">
            <img src={data?.profilePic} className="w-full mx-auto" />
          </div>
          <div className="w-2/3 mt-5 text-xl p-5">
            <div className="mt-1 mb-2 text-2xl font-semibold">
              Name : {data?.name}
            </div>
            <div className="mt-1 mb-2 text-2xl font-semibold">
              Mobile : {data?.mobileNo}
            </div>
            <div className="mt-1 mb-2 text-2xl font-semibold">
              Address : {data?.address}
            </div>
            <div className="mt-1 mb-2 text-2xl font-semibold">
              Joined Date:{" "}
              {data?.createdAt ? formatDate(data.createdAt) : "Not Set"}
            </div>
            <div className="mt-1 mb-2 text-2xl font-semibold">
              Next Bill Date:{" "}
              {data?.nextBillDate ? formatDate(data.nextBillDate) : "Not Set"}
            </div>
            <div className="mt-1 mb-2 flex gap-4 text-2xl font-semibold">
              Status:{" "}
              <Switch
                onColor="#6366F1"
                checked={status === "Active"}
                onChange={handleSwitchBtn}
              />
            </div>
            {isDateInPast(data?.nextBillDate) && (
              <div
                onClick={() => {
                  setRenew((prev) => !prev);
                }}
                className={`mt-1 rounded-lg p-3 border-2 border-slate-900 text-center ${
                  renew && status === "Active"
                    ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white"
                    : null
                } w-full md:w-1/2 cursor-pointer hover:text-white hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500`}
              >
                Renew
              </div>
            )}

            {renew && status === "Active" ? (
              <div className="rounded-lg p-3 mt-5  mb-5 h-fit bg-slate-50 md:w-[100%]">
                <div className="w-full">
                  <div className="my-5">
                    <div>Membership</div>

                    <select
                      value={planMember}
                      onChange={handleOnChangeSelect}
                      className="w-full border-2 p-2 rounded-lg"
                    >
                      {membership.map((item, index) => {
                        return (
                          <option value={item._id}>
                            {item.months} Months Membership
                          </option>
                        );
                      })}
                    </select>
                    <div
                      className={`mt-3 rounded-lg p-3 border-2 border-slate-900 text-center w-1/2 mx-auto cursor-pointer hover:text-white hover:bg-gradient-to-r from-indigo-500 to-pink-500`}
                      onClick={() => {
                        handleRenewSaveBtn();
                      }}
                    >
                      Pay Now
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default MemberDetail;
