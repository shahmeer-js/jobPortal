"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth_service, useAppData } from "@/context/AppContext";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  const { isAuth } = useAppData();

  if (isAuth) return redirect("/");

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${auth_service}/forgot-password`,
        {
          email,
        },
      );

      toast.success(data.message);
      setEmail("");
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  };
  return (
    <div className="mt-20 md:mt-5 z-0">
      <div className="md:w-1/3 border-gray-400 rounded-lg p-8 flex flex-col w-full relative shadow-md m-auto">
        <h2 className="mb-1">
          <span className="text-3xl">Forgot Password</span>
        </h2>
        <form
          onSubmit={submitHandler}
          className="flex flex-col justify-between mt-3"
        >
          <div className="grid w-full max-w-sm items-center gap-1.5 ml-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button
              disabled={btnLoading}
              className="flex justify-center items-center gap-2"
            >
              Submit
            </Button>
          </div>
        </form>
        <Link
          href={"/login"}
          className="mt-2 text-blue-500 underline text-sm ml-2"
        >
          Go to login page
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
