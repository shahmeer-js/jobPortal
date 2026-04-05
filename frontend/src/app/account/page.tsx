"use client";

import React from "react";
import { redirect } from "next/navigation";

import { useAppData } from "@/context/AppContext";
import Loading from "@/components/loading";
import Info from "./components/info";
import Skills from "./components/skills";
import Company from "./components/company";
import Application from "./components/applications";

const AccountPage = () => {
  const { isAuth, user, loading } = useAppData();

  if (loading) return <Loading />;

  if (!isAuth) return redirect("/login");

  return (
    <>
      {user && (
        <div className="w-[90%] md:w-[60%] m-auto">
          <Info user={user} isYourAccount={true} />
          {user.role === "jobseeker" && (
            <Skills user={user} isYourAccount={true} />
          )}
          {user.role === "recruiter" && <Company />}
          {
            user.role === "jobseeker" && (
              <Application />
            )
          }
        </div>
      )}
    </>
  );
};

export default AccountPage;
