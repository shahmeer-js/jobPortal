"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

const PaymentCancelPage = () => {
  const router = useRouter();
  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="flex items-center justify-center mb-4 gap-4">
          <XCircle className="text-red-500" size={48} />
          <h2 className="text-2xl font-bold">Payment Cancelled!</h2>
        </div>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. If you have any questions, please contact
          support.
        </p>
        <button
          onClick={() => router.push("/subscribe")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Go to Payment Page (for again trying payment)
        </button>
      </Card>
    </div>
  );
};

export default PaymentCancelPage;
