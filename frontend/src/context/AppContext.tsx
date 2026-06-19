"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";
import { AppContextType, Application, AppProviderProps, User } from "@/type";

export const auth_service = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth`;
export const utils_service = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/utils`;
export const user_service = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`;
export const job_service = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/job`;
export const payment_service = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment`;

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [userApplications, setUserApplications] = useState<
    Application[] | null
  >(null);

  const token = Cookies.get("token");

  async function fetchUser() {
    try {
      const { data } = await axios.get(`${user_service}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data);
      setIsAuth(true);
      if (data.role === "jobseeker") {
        fetchUserApplications();
      }
    } catch (error) {
      console.log(error);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserApplications() {
    try {
      const { data } = await axios.get(
        `${user_service}/application/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUserApplications(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  }

  async function updateProfilePic(formData: FormData) {
    setBtnLoading(true);
    try {
      const { data } = await axios.put(
        `${user_service}/update/pic`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(data.message);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  }

  async function updateResume(formData: FormData) {
    setBtnLoading(true);
    try {
      const { data } = await axios.put(
        `${user_service}/update/resume`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchUser();
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  }

  async function updateUser(name: string, phoneNumber: string, bio: string) {
    setBtnLoading(true);
    try {
      const { data } = await axios.put(
        `${user_service}/update/profile`,
        {
          name,
          phone_number: phoneNumber,
          bio,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(data.message);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  }

  async function logoutUser() {
    Cookies.set("token", "");
    setUser(null);
    setIsAuth(false);
    toast.success("Logged out Successfully");
  }

  async function addSkill(
    skill: string,
    setSkill: React.Dispatch<React.SetStateAction<string>>,
  ) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${user_service}/skill/add`,
        {
          skillName: skill,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(data.message);
      setSkill("");
      fetchUser();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  }

  async function removeSkill(skill: string) {
    try {
      const { data } = await axios.put(
        `${user_service}/skill/remove`,
        {
          skillName: skill,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(data.message);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  }

  async function applyJob(jobId: number) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${user_service}/apply/job`,
        {
          job_id: jobId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(data.message);
      fetchUserApplications();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        userApplications,
        loading,
        btnLoading,
        isAuth,
        setUser,
        setLoading,
        setIsAuth,
        logoutUser,
        updateProfilePic,
        updateResume,
        updateUser,
        addSkill,
        removeSkill,
        applyJob,
        fetchUserApplications,
      }}
    >
      {children}
      <Toaster />
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within AppProvider");
  }
  return context;
};
