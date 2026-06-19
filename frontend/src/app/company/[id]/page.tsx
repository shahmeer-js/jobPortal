"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Globe,
  Laptop,
  Loader,
  MapPin,
  Pencil,
  Plus,
  User,
  XCircle,
} from "lucide-react";
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";

import { job_service, useAppData } from "@/context/AppContext";
import { Company, Job } from "@/type";
import Loading from "@/components/loading";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CompanyPage = () => {
  const { id } = useParams();
  const token = Cookies.get("token");

  const { user, isAuth } = useAppData();

  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const addModalRef = useRef<HTMLButtonElement>(null);
  const updateModalRef = useRef<HTMLButtonElement>(null);

  //Job States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");
  const [openings, setOpenings] = useState("");
  const [jobType, setJobType] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [isActive, setIsActive] = useState(true);

  const clearJobInputs = () => {
    setTitle("");
    setDescription("");
    setRole("");
    setSalary("");
    setLocation("");
    setOpenings("");
    setJobType("");
    setWorkLocation("");
    setIsActive(true);
  };

  const addJobHandler = async () => {
    setBtnLoading(true);
    try {
      const jobData = {
        title,
        description,
        role,
        salary: Number(salary),
        location,
        openings: Number(openings),
        job_type: jobType,
        work_location: workLocation,
        company_id: id,
      };

      const { data } = await axios.post(`${job_service}/new`, jobData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(data.message);
      fetchCompany();
      clearJobInputs();
      addModalRef.current?.click();
    } catch (error: any) {
      toast.error(error?.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  };

  const handleOpenUpdateModal = (job: Job) => {
    setSelectedJob(job);
    setTitle(job.title);
    setDescription(job.description);
    setRole(job.role);
    setSalary(String(job.salary || ""));
    setLocation(job.location || "");
    setOpenings(String(job.openings || ""));
    setJobType(job.job_type);
    setWorkLocation(job.work_location);
    setIsActive(job.is_active);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedJob(null);
    clearJobInputs();
  };

  const updateJobHandler = async () => {
    if (!selectedJob) return;

    setBtnLoading(true);

    try {
      const jobData = {
        title,
        description,
        role,
        salary: Number(salary),
        location,
        openings: Number(openings),
        job_type: jobType,
        work_location: workLocation,
        is_active: isActive,
      };

      const { data } = await axios.put(
        `${job_service}/${selectedJob.job_id}`,
        jobData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success(data.message);
      fetchCompany();
      handleCloseUpdateModal();
    } catch (error: any) {
      toast.error(error?.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  };

  async function fetchCompany() {
    try {
      setLoading(true);
      const { data } = await axios.get(`${job_service}/company/${id}`);
      setCompany(data);
    } catch (error: any) {
      toast.error(error?.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCompany();
  }, []);

  const isRecruiterOwner =
    user && company && user.user_id === company.recruiter_id;

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-secondary/30">
      {company && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card className="overflow-hidden shadow-lg border-2 mb-8">
            <div className="h-32 bg-blue-600"></div>
            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-14">
                <div className="w-32 h-32 rounded-2xl border-4 border-bg overflow-hidden shadow-xl bg-background shrink-0">
                  <Image
                    src={company.logo}
                    alt={company.name}
                    className="w-full h-full object-cover"
                    width={100}
                    height={100}
                  />
                </div>

                <div className="flex-1 md:mb-4">
                  <h1 className="text-3xl font-bold mb-2">{company.name}</h1>
                  <p className="text-base leading-relaxed opacity-80 max-w-3xl">
                    {company.description}
                  </p>
                </div>
                <Link
                  href={company.website}
                  target="_blank"
                  className="md:mb-4"
                >
                  <Button className="gap-2">
                    <Globe size={18} />
                    Visit Website
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          <Dialog>
            {/* Job Section */}

            <Card className="shadow-lg border-2 overflow-hidden">
              <div className="bg-blue-600 border-b p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Briefcase
                        size={20}
                        className="text-blue-600 dark:text-white"
                      />
                    </div>
                    <CardTitle className="text-2xl text-white">
                      {isRecruiterOwner ? "Your Posted Jobs" : "Posted Jobs"}
                    </CardTitle>
                  </div>
                  <p className="text-sm opacity-70 text-white">
                    {company.jobs?.length || 0} active job
                    {company.jobs?.length !== 1 && "s"}
                  </p>
                </div>
              </div>

              {isRecruiterOwner && (
                <>
                  <DialogTrigger asChild>
                    <Button className="gap-2 mx-2">
                      <Plus size={18} />
                      Post New Job
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl flex items-center gap-2">
                        Post a new job
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="title"
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <Briefcase size={16} /> Job Title
                        </Label>
                        <Input
                          id="title"
                          type="text"
                          placeholder="Enter job title"
                          className="h-11"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="description"
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <FileText size={16} /> Job Description
                        </Label>
                        <Input
                          id="description"
                          type="text"
                          placeholder="Enter job description"
                          className="h-11"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="role"
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <Building2 size={16} /> Role/Department
                        </Label>
                        <Input
                          id="role"
                          type="text"
                          placeholder="e.g. HR, Manager etc"
                          className="h-11"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="salary"
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <DollarSign size={16} /> Salary
                        </Label>
                        <Input
                          id="salary"
                          type="number"
                          placeholder="1-1000000..."
                          className="h-11"
                          value={salary}
                          onChange={(e) => setSalary(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="openings"
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <User size={16} /> Openings
                        </Label>
                        <Input
                          id="openings"
                          type="number"
                          placeholder="e.g. 5"
                          className="h-11"
                          value={openings}
                          onChange={(e) => setOpenings(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="location"
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <MapPin size={16} /> Location
                        </Label>
                        <Input
                          id="location"
                          type="text"
                          className="h-11"
                          placeholder="Your Company location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="jobType"
                            className="text-sm font-medium flex items-center gap-1"
                          >
                            <Clock size={16} /> Job Type
                          </Label>
                          <Select value={jobType} onValueChange={setJobType}>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select Job Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Full-time">
                                Full Time
                              </SelectItem>
                              <SelectItem value="Part-time">
                                Part Time
                              </SelectItem>
                              <SelectItem value="Contract">Contract</SelectItem>
                              <SelectItem value="Internship">
                                Internship
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="workLocation"
                            className="text-sm font-medium flex items-center gap-1"
                          >
                            <Laptop size={16} /> Work Location
                          </Label>
                          <Select
                            value={workLocation}
                            onValueChange={setWorkLocation}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select Work Location" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="On-site">On-site</SelectItem>
                              <SelectItem value="Remote">Remote</SelectItem>
                              <SelectItem value="Hybrid">Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button ref={addModalRef} variant={"outline"}>
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button disabled={btnLoading} onClick={addJobHandler}>
                        {btnLoading ? (
                          <>
                            <Loader className="animate-spin" /> Posting Job
                          </>
                        ) : (
                          <>Post Job</>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </>
              )}

              <div className="p-6">
                {company.jobs && company.jobs.length > 0 ? (
                  <div className="space-y-4">
                    {company.jobs.map((job) => (
                      <div
                        className="p-5 rounded-lg border-2 hover:border-blue-500 transition-all bg-background"
                        key={job.job_id}
                      >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <h3 className="text-xl font-semibold">
                                {job.title}
                              </h3>
                              <span
                                className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${job.is_active ? "bg-green-100 dark:bg-green-900/30 text-green-600" : "bg-gray-100 dark:bg-gray-800 text-gray-800"}`}
                              >
                                {job.is_active ? (
                                  <>
                                    <CheckCircle size={14} /> Active
                                  </>
                                ) : (
                                  <>
                                    <XCircle size={14} /> Inactive
                                  </>
                                )}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
                              <div className="flex items-center gap-2 opacity-70">
                                <Building2 size={16} />
                                <span>{job.role}</span>
                              </div>
                              <div className="flex items-center gap-2 opacity-70">
                                <DollarSign size={16} />
                                <span>
                                  {job.salary
                                    ? `PKR ${job.salary.toLocaleString()}`
                                    : "Not Disclosed"}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 opacity-70">
                                <MapPin size={16} />
                                <span>{job.location}</span>
                              </div>

                              <div className="flex items-center gap-2 opacity-70">
                                <Laptop size={16} />
                                <span>
                                  {job.work_location} ({job.job_type})
                                </span>
                              </div>

                              <div className="flex items-center gap-2 opacity-70">
                                <User size={16} />
                                <span>{job.openings} openings</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link href={`/jobs/${job.job_id}`}>
                              <Button
                                variant={"outline"}
                                size={"sm"}
                                className="gap-2"
                              >
                                <Eye size={16} />
                                View
                              </Button>
                            </Link>

                            {isRecruiterOwner && (
                              <>
                                <Button
                                  onClick={() => handleOpenUpdateModal(job)}
                                  variant={"outline"}
                                  size={"sm"}
                                  className="gap-2"
                                >
                                  <Pencil size={16} />
                                  Edit
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                        <Briefcase size={32} className="opacity-40" />
                      </div>
                      <p className="text-base opacity-70">No Jobs Posted Yet</p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </Dialog>

          <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
            <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  Update job
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Briefcase size={16} /> Job Title
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter job title"
                    className="h-11"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <FileText size={16} /> Job Description
                  </Label>
                  <Input
                    id="description"
                    type="text"
                    placeholder="Enter job description"
                    className="h-11"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="role"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Building2 size={16} /> Role/Department
                  </Label>
                  <Input
                    id="role"
                    type="text"
                    placeholder="e.g. HR, Manager etc"
                    className="h-11"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="salary"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <DollarSign size={16} /> Salary
                  </Label>
                  <Input
                    id="salary"
                    type="number"
                    placeholder="1-1000000..."
                    className="h-11"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="openings"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <User size={16} /> Openings
                  </Label>
                  <Input
                    id="openings"
                    type="number"
                    placeholder="e.g. 5"
                    className="h-11"
                    value={openings}
                    onChange={(e) => setOpenings(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="location"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <MapPin size={16} /> Location
                  </Label>
                  <Input
                    id="location"
                    type="text"
                    className="h-11"
                    placeholder="Your Company location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="jobType"
                      className="text-sm font-medium flex items-center gap-1"
                    >
                      <Clock size={16} /> Job Type
                    </Label>
                    <Select value={jobType} onValueChange={setJobType}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select Job Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full Time</SelectItem>
                        <SelectItem value="Part-time">Part Time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="workLocation"
                      className="text-sm font-medium flex items-center gap-1"
                    >
                      <Laptop size={16} /> Work Location
                    </Label>
                    <Select
                      value={workLocation}
                      onValueChange={setWorkLocation}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select Work Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="On-site">On-site</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="isActive"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      {isActive ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <XCircle size={16} className="text-gray-50" />
                      )}
                    </Label>
                    <Select
                      value={isActive ? "true" : "false"}
                      onValueChange={(value) => setIsActive(value === "true")}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select Job Statue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button ref={updateModalRef} variant={"outline"}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button disabled={btnLoading} onClick={updateJobHandler}>
                  {btnLoading ? (
                    <>
                      <Loader className="animate-spin" /> Updating Job
                    </>
                  ) : (
                    <>Update Job</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default CompanyPage;
