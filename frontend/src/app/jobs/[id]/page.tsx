"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { job_service, useAppData } from "@/context/AppContext";
import { Application, Job } from "@/type";
import axios from "axios";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Clock,
  DollarSign,
  Laptop,
  Loader,
  MapPin,
  User,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const JobPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuth, applyJob, userApplications, btnLoading } = useAppData();
  const token = Cookies.get("token");

  const [job, setJob] = useState<Job | null>(null);
  const [jobApplications, setJobApplications] = useState<Application[]>([]);
  const [isJobApplied, setIsJobApplied] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [applicationStatus, setApplicationStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const date = new Date(job ? job?.created_at : "");

  const formattedDate = date
    .toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour12: true,
    })
    .replace(",", "");

  const applyJobHandler = (jobId: number) => {
    applyJob(jobId);
  };

  async function fetchSingleJob() {
    try {
      const { data } = await axios.get(`${job_service}/${id}`);
      setJob(data);
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchJobApplications() {
    try {
      const { data } = await axios.get(
        `${job_service}/application/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setJobApplications(data);
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  const updateApplicationHandler = async (id: number) => {
    if (applicationStatus === "")
      return toast.error("Please give a valid value");

    try {
      const { data } = await axios.put(
        `${job_service}/application/${id}`,
        {
          status: applicationStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(data.message);
      fetchJobApplications();
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    const applied =
      Array.isArray(userApplications) &&
      userApplications.some((application) => application.job_id === Number(id));

    setIsJobApplied(applied);
  }, [userApplications, id]);

  useEffect(() => {
    if (user && job && user.user_id === job.posted_by_recruiter) {
      fetchJobApplications();
    }
  }, [user, job]);

  useEffect(() => {
    fetchSingleJob();
  }, []);

  const filteredApplications =
    filterStatus === "All"
      ? jobApplications
      : jobApplications?.filter(
          (application) => application.status === filterStatus,
        );

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-secondary/30">
      {job ? (
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Button
            variant={"ghost"}
            className="mb-6 gap-2"
            onClick={() => router.back()}
          >
            <ArrowRight size={18} />
            Back to Previous Page
          </Button>

          <Card className="overflow-hidden shadow-lg border-2 mb-6">
            <div className="bg-blue-600 p-8 border-b">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${job.is_active ? "bg-green-500 text-white dark:bg-green-700" : "bg-red-500 text-white dark:bg-red-700"}`}
                    >
                      {job.is_active ? "Open" : "Closed"}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-2 text-base opacity-70 mb-2 text-blue-100/80">
                    <CalendarClock />
                    {formattedDate}
                  </div>
                </div>
                {user && user.role === "jobseeker" && (
                  <div className="shrink-0">
                    {isJobApplied ? (
                      <>
                        <div className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 font-medium">
                          <CheckCircle2 size={20} />
                          Already Applied
                        </div>
                      </>
                    ) : (
                      <>
                        {job.is_active && (
                          <Button
                            onClick={() => applyJobHandler(job.job_id)}
                            disabled={btnLoading || loading}
                            className="gap-2 h-12 px-4"
                          >
                            {btnLoading ? (
                              <>
                                <Loader className="animate-spin" />
                                Applying
                              </>
                            ) : (
                              <>
                                <Briefcase size={18} />
                                Easy Apply
                              </>
                            )}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Job Details */}
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-background">
                  <div className="h-11 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <MapPin size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs opacity-70 font-medium mb-1">
                      Location
                    </p>
                    <p className="font-semibold">{job.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg border bg-background">
                  <div className="h-11 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <DollarSign size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs opacity-70 font-medium mb-1">
                      Salary
                    </p>
                    <p className="font-semibold">PKR {job.salary} P.A</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg border bg-background">
                  <div className="h-11 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs opacity-70 font-medium mb-1">
                      Openings
                    </p>
                    <p className="font-semibold">
                      {Number(job.openings)} Positions
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg border bg-background">
                  <div className="h-11 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Laptop size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs opacity-70 font-medium mb-1">
                      Work Location
                    </p>
                    <p className="font-semibold">{job.work_location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg border bg-background">
                  <div className="h-11 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Clock size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs opacity-70 font-medium mb-1">
                      Job Type
                    </p>
                    <p className="font-semibold">{job.job_type}</p>
                  </div>
                </div>
              </div>

              {/* Job Description */}

              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Briefcase size={24} className="text-blue-600" />
                  Job Description
                </h2>

                <div className="p-6 rounded-lg bg-secondary border">
                  <div className="text-base leading-relaxed whitespace-pre-line">
                    {job.description}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center">
          Job Not Found
        </div>
      )}

      {user && job && user.user_id === job.posted_by_recruiter && (
        <div className="w-[90%] md:w-2/3 container mx-auto mt-8 mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-2xl font-bold">All Applications</h2>
            <div className="flex items-center gap-2">
              <label htmlFor="filter-status" className="text-sm font-medium">
                Filter:
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 border-2 border-gray-300 rounded-md bg-background"
              >
                <option value="All">All Status</option>
                <option value="Submitted">Submitted</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {filteredApplications && filteredApplications.length > 0 ? (
            <>
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div
                    className="p-4 rounded-lg border-2 bg-background"
                    key={application.application_id}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium dark:text-white ${application.status === "Hired" ? "bg-green-100 dark:bg-green-900/30 text-green-600" : application.status === "Rejected" ? "bg-red-100 dark:bg-red-900/30 text-red-600" : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600"}`}
                      >
                        {application.status}
                      </span>
                      <span>{application.applicant_email}</span>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <Link
                        target="_blank"
                        href={application.resume}
                        className="text-blue-500 hover:underline text-sm transition-colors"
                      >
                        View Resume
                      </Link>
                      <Link
                        target="_blank"
                        href={`/account/${application.applicant_id}`}
                        className="text-blue-500 hover:underline text-sm transition-colors"
                      >
                        View Profile
                      </Link>
                    </div>
                    {/* Update Status */}

                    <div className="flex gap-2 pt-3 border-t">
                      <select
                        value={applicationStatus}
                        onChange={(e) => setApplicationStatus(e.target.value)}
                        className="flex-1 p-2 border-2 border-gray-300 rounded-md bg-background"
                      >
                        <option value="">Update Status</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Hired">Hired</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <Button
                        onClick={() =>
                          updateApplicationHandler(application.application_id)
                        }
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredApplications.length === 0 && (
                <p className="text-center py-8 opacity-70">
                  No Application with status ${filterStatus}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-center py-8 opacity-70">No Applications Yet</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default JobPage;
