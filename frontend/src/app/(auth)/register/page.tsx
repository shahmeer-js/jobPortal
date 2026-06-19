"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

import { auth_service, useAppData } from "@/context/AppContext";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  Briefcase,
  FileText,
  Lock,
  Mail,
  Phone,
  Quote,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loading from "@/components/loading";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  const { isAuth, setUser, loading, setIsAuth } = useAppData();

  if (loading) return <Loading />;

  if (isAuth) return redirect("/");

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setBtnLoading(true);

    const formData = new FormData();

    formData.append("role", role);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("phone_number", phoneNumber);

    if (role === "jobseeker") {
      formData.append("bio", bio);
      formData.append("file", resume as File);
    }

    try {
      const { data } = await axios.post(
        `${auth_service}/register`,
        formData,
      );

      toast.success(data.message);

      Cookies.set("token", data.token, {
        expires: 15,
        secure: false,
        path: "/",
      });

      setUser(data.user);
      setIsAuth(true);
    } catch (error: any) {
      toast.error(error?.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Join Query<span className="text-red-600">Jobs</span>
          </h1>
          <p className="text-sm opacity-70">
            Create your account to start a new journey
          </p>
        </div>
        <div className="border-gray-400 rounded-2xl p-8 shadow-lg backdrop-blur-sm">
          <form onSubmit={submitHandler} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">
                I want to
              </Label>
              <div className="relative">
                <Briefcase className="icon-style" />
                <select
                  name="role"
                  id="role"
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setRole(e.target.value)
                  }
                  className="w-full h-11 pl-10 pr-4 border-2 border-gray-300 rounded-md bg-transparent"
                  required
                >
                  <option value="" className="dark:text-black">
                    Select Your role
                  </option>
                  <option value="jobseeker" className="dark:text-black">
                    Find a Job
                  </option>
                  <option value="recruiter" className="dark:text-black">
                    Hire a Talent
                  </option>
                </select>
              </div>
            </div>

            {role && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Name
                  </Label>
                  <div className="relative">
                    <User className="icon-style" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Abdullah"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="icon-style" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="icon-style" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="icon-style" />
                    <Input
                      id="phone"
                      type="number"
                      placeholder="+921234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                {role === "jobseeker" && (
                  <div className="space-y-5 border-t border-gray-400 pt-3">
                    <div className="space-y-2">
                      <Label htmlFor="resume" className="text-sm font-medium">
                        Resume (*PDF)
                      </Label>
                      <div className="relative">
                        <FileText className="icon-style" />
                        <Input
                          id="resume"
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setResume(e.target.files[0]);
                            }
                          }}
                          required
                          className="pl-10 h-11 cursor-pointer pt-2"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-sm font-medium">
                        Bio
                      </Label>
                      <div className="relative">
                        <Quote className="icon-style" />
                        <Input
                          id="bio"
                          type="text"
                          placeholder="Tell us about yourself"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          required
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <Button disabled={btnLoading} className="w-full">
                  {btnLoading ? "Registering..." : "Register"}
                  <ArrowRight size={18} />
                </Button>
              </div>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-gray-300">
            <p className="text-center text-sm">
              Already have an account{" "}
              <Link
                href={"/login"}
                className="text-blue-500 font-medium hover:underline transition-all"
              >
                Login?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
