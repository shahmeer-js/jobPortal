"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";

import { useAppData } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const Application = () => {
  const { userApplications } = useAppData();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 ">
      <Card className="shadow-lg border-2 overflow-hidden">
        <div className="bg-blue-500 p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Briefcase size={20} className="text-blue-600 dark:text-white" />
            </div>
            <CardTitle className="text-2xl text-white">
              Your Applications
            </CardTitle>
            <CardDescription className="text-sm mt-1 text-white">
              ({userApplications?.length} application
              {userApplications && userApplications?.length > 1 && "s"})
            </CardDescription>
          </div>
        </div>

        <div className="p-6">
          {userApplications && userApplications.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {userApplications.map((application) => (
                <div
                  key={application.application_id}
                  className={`w-full p-4 flex flex-wrap gap-3 justify-between shadow-sm rounded-md relative border ${application.status === "Hired" ? "border-green-600" : application.status === "Rejected" ? "border-red-500" : "border-gray-600"}`}
                >
                  <div
                    className={`w-18 py-0.5 text-center text-sm absolute -top-2 -left-7 -rotate-45 rounded ${application.status === "Hired" ? "bg-green-600" : application.status === "Rejected" ? "bg-red-500" : "bg-gray-600"} text-white`}
                  >
                    {application.status}
                  </div>
                  <h4 className="flex items-center justify-center text-base font-medium">
                    {application.job_title}
                  </h4>
                  <div className="flex items-center justify-center gap-4">
                    <p className="text-sm opacity-70">
                      PKR {application.job_salary} P.A
                    </p>
                    |
                    <p className="text-sm opacity-70">
                      {application.job_location}
                    </p>
                  </div>
                  <Button className="group">
                    <Link href={`/jobs/${application.job_id}`}>Go to Job</Link>
                    <ArrowRight className="group-hover:translate-x-0.5 transition-all" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <h3 className="text-lg opacity-70">
                You have no applications yet
              </h3>
              <Link href={"/jobs"} className="text-blue-600 hover:underline">
                Go to Jobs
              </Link>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Application;
