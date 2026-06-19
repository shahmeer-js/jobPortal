"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

import { user_service } from "@/context/AppContext";
import { User } from "@/type";
import Loading from "@/components/loading";
import Info from "../components/info";
import Skills from "../components/skills";

const UserAccount = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();

  async function fetchUser() {
    const token = Cookies.get("token");
    try {
      const { data } = await axios.get(`${user_service}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data);
    } catch (error: any) {
      toast.error(error?.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, [id]);

  if (loading) return <Loading />;

  return (
    <>
      {user && (
        <div className="w-[90%] md:w-[60%] m-auto">
          <Info user={user} isYourAccount={false} />
          {user.role === "jobseeker" && (
            <Skills user={user} isYourAccount={false} />
          )}
        </div>
      )}
    </>
  );
};

export default UserAccount;
