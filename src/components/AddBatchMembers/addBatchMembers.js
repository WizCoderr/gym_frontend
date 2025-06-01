import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import Stack from "@mui/material/Stack";
import LinearProgress from "@mui/material/LinearProgress";
import { ToastContainer, toast } from "react-toastify";

const AddBatchMembers = () => {
  const [inputField, setInputField] = useState({
    name: "",
    mobileNo: "",
    address: "",
    batch: "",
    profilePic:
      "https://th.bing.com/th/id/OIP.gj6t3grz5no6UZ03uIluiwHaHa?rs=1&pid=ImgDetMain",
    joiningDate: "",
  });
  const [imageLoader, setImageLoader] = useState(false);
  const [batchesList, setBatchesList] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  const navigate = useNavigate();

  const handleOnChange = (event, name) => {
    setInputField({ ...inputField, [name]: event.target.value });
  };

  const uploadImage = async (event) => {
    setImageLoader(true);
    console.log("Image Uploading");
    const files = event.target.files;
    const data = new FormData();
    data.append("file", files[0]);

    // dspq6kj00
    data.append("upload_preset", "gym-management");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dspq6kj00/image/upload",
        data
      );
      console.log(response);
      const imageUrl = response.data.url;
      setInputField({ ...inputField, ["profilePic"]: imageUrl });
      setImageLoader(false);
    } catch (err) {
      console.log(err);
      setImageLoader(false);
    }
  };

  const fetchBatches = async () => {
    await axios
      .get("https://gym-backend-3jbg.onrender.com/batches/get-batches", {
        withCredentials: true,
      })
      .then((response) => {
        setBatchesList(response.data.batches);
        if (response.data.batches.length === 0) {
          return toast.error("No batches added yet", {
            className: "text-lg",
          });
        } else {
          let a = response.data.batches[0]._id;
          setSelectedOption(a);
          setInputField({ ...inputField, batch: a });
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something Wrong Happened");
      });
  };

  useEffect(() => {
    console.log(inputField);
    fetchBatches();
  }, []);

  const handleOnChangeSelect = (event) => {
    let value = event.target.value;
    setSelectedOption(value);
    setInputField({ ...inputField, batch: value });
  };

  const handleRegisterButton = async () => {
    try {
      // Input validation
      if (
        !inputField.name ||
        !inputField.mobileNo ||
        !inputField.address ||
        !inputField.joiningDate ||
        !inputField.batch
      ) {
        toast.error("Please fill all required fields");
        return;
      }

      const batch = batchesList.find((b) => b._id === inputField.batch);
      if (!batch) {
        toast.error("Selected batch not found");
        return;
      }

      // Store batch member data in session storage
      sessionStorage.setItem(
        "pendingBatchMember",
        JSON.stringify({
          batchId: inputField.batch,
          members: [
            {
              name: inputField.name,
              mobileNo: inputField.mobileNo,
              address: inputField.address,
              joiningDate: inputField.joiningDate,
              profilePic: inputField.profilePic,
            },
          ],
        })
      );

      // Create payment session
      const response = await axios.post(
        "https://gym-backend-3jbg.onrender.com/payment/create-session",
        {
          amount: batch.price,
          type: "batch_membership",
          description: `Batch Registration: ${batch.name}`,
          metadata: {
            memberName: inputField.name,
            batchId: batch._id,
            batchName: batch.name,
          },
        },
        { withCredentials: true }
      );
      const stripe = await loadStripe(
        "pk_test_51RLkPGQewoVc3PzjZWCtow2VaH7rJj9SVoiQXajish5JeMsR2zhMxQg2RA96bTJTz3bUqHOVqAV2pW5gQRpnoK0V00YvwKozhN"
      );
      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.sessionId,
      });
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error(err);
      toast.error("Failed to process batch registration");
    }
  };

  return (
    <div className="text-black">
      <div className="grid gap-5 grid-cols-2 text-lg">
        <input
          value={inputField.name}
          onChange={(event) => {
            handleOnChange(event, "name");
          }}
          placeholder="Name of the Joinee"
          type="text"
          className="border-2 w-[90%] pl-3 pr-3 pt-2 border-slate-400 rounded-md h-12"
        />
        <input
          value={inputField.mobileNo}
          onChange={(event) => {
            handleOnChange(event, "mobileNo");
          }}
          placeholder="Mobile No"
          type="text"
          className="border-2 w-[90%] pl-3 pr-3 pt-2 border-slate-400 rounded-md h-12"
        />
        <input
          value={inputField.address}
          onChange={(event) => {
            handleOnChange(event, "address");
          }}
          placeholder="Enter Address"
          type="text"
          className="border-2 w-[90%] pl-3 pr-3 pt-2 border-slate-400 rounded-md h-12"
        />
        <input
          value={inputField.joiningDate}
          onChange={(event) => {
            handleOnChange(event, "joiningDate");
          }}
          type="date"
          className="border-2 w-[90%] pl-3 pr-3 pt-2 border-slate-400 rounded-md h-12"
        />

        <select
          value={selectedOption}
          onChange={handleOnChangeSelect}
          className="border-2 w-[90%] h-12 pt-2 pb-2 border-slate-400 rounded-md placeholder:text-gray"
        >
          {batchesList.map((item, index) => {
            return (
              <option key={index} value={item._id}>
                {item.name} Batch
              </option>
            );
          })}
        </select>

        <input type="file" onChange={(e) => uploadImage(e)} />

        <div className="w-[100px] h-[150px]">
          <img
            src={inputField.profilePic}
            className="w-full h-full rounded-full"
            alt="Profile"
          />
          {imageLoader && (
            <Stack sx={{ width: "100%", color: "grey.500" }} spacing={2}>
              <LinearProgress color="secondary" />
            </Stack>
          )}
        </div>

        <div
          onClick={() => handleRegisterButton()}
          className="p-3 border-2 w-28 text-lg h-14 text-center bg-slate-900 text-white rounded-xl cursor-pointer hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
        >
          Pay Now
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AddBatchMembers;
