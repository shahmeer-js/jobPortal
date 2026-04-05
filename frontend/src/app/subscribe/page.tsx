"use client";

import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

import { payment_service, useAppData } from "@/context/AppContext";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";

const SubscriptionPage = () => {
  const { user } = useAppData();
  const [btnLoading, setBtnLoading] = useState(false);
  const router = useRouter();
  const plan = {
    name: "Premium Subscription",
    price: 299,
    priceId: "price_1TIPFaLP9z6feah1EFLEoax1",
    features: [
      "Access to premium features",
      "Job application will be displayed on top to the recruiter",
    ],
  };

  const handleSubscribe = async (priceId: string) => {
    setBtnLoading(true);
    const token = Cookies.get("token");
    try {
      const { data } = await axios.post(
        `${payment_service}/api/payment/checkout`,
        {
          priceId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      window.location.href = data.url;
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <>
      {user && user.role === "jobseeker" ? (
        <div className="min-h-screen w-full p-4 flex items-center justify-center bg-background">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-black">{plan.name}</h2>
            <p className="text-gray-600 mb-4">Price: ₹{plan.price} / month</p>
            <ul className="list-disc list-inside mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="text-gray-600">
                  {feature}
                </li>
              ))}
            </ul>
            {user?.subscription && new Date(user.subscription) > new Date() ? (
              <div className="text-gray-600 w-full bg-gray-200 py-2 px-4 rounded flex justify-center items-center">
                You are already subscribed.
              </div>
            ) : (
              <button
                onClick={() => handleSubscribe(plan.priceId)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200 disabled:bg-gray-400 flex justify-center items-center"
                disabled={btnLoading}
              >
                {btnLoading ? (
                  <Loader className="animate-spin" />
                ) : (
                  "Subscribe Now"
                )}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full min-h-screen flex items-center flex-col justify-center gap-4">
          <div className="text-gray-600 text-lg">
            Please login to subscribe.
          </div>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
          >
            Go to Login Page
          </button>
        </div>
      )}
    </>
  );
};

export default SubscriptionPage;
