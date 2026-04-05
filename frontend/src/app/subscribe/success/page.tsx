"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import Loading from "@/components/loading";
import { payment_service } from "@/context/AppContext";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const PaymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const token = Cookies.get("token");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const verifyPayment = async () => {
    const sessionId = searchParams.get("session_id") || "";
    try {
      const { data } = await axios.get(
        `${payment_service}/api/payment/verify/?session_id=${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(data.message);

      setTimeout(() => {
        router.push("/account");
      }, 2000);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Payment verification failed",
      );
      setTimeout(() => {
        router.push("/subscribe/cancel");
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyPayment();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="flex items-center justify-center mb-4 gap-4">
          <CheckCircle2 className="text-green-500" size={48} />
          <h2 className="text-2xl font-bold">Payment Successful!</h2>
        </div>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your subscription is now active.
        </p>
        <button
          onClick={() => router.push("/account")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Go to My Account
        </button>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
