import React from "react";
import {
  ArrowRight,
  Briefcase,
  Check,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-secondary">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blu-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl"></div>
      </div>
      <div className="container mx-auto px-24 py-16 md:py-24 relative">
        <div className="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-16">
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-background/50 backdrop-blur-sm">
              <TrendingUp size={16} className="text-blue-600" />
              <span className="text-sm font-medium">
                #1 Job Platform in the world
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Find your Dream Job at{" "}
              <span className="inline-block">
                Query<span className="text-red-500">Jobs</span>
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl leading-relaxed opacity-80 max-w-2xl">
              Bridge the gap between talent and opportunity. From intuitive job
              discovery to powerful recruitment tools, experience a seamless
              connection to your next big move.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center md:justify-start gap-8 py-4">
              <div className="text-center md:text-left">
                <p className="text-3xl font-bold text-blue-600 tracking-tight">10k+</p>
                <p className="text-sm opacity-70">Active Jobs</p>
              </div>

              <div className="text-center md:text-left">
                <p className="text-3xl font-bold text-blue-600 tracking-tight">5k+</p>
                <p className="text-sm opacity-70">Companies</p>
              </div>

              <div className="text-center md:text-left">
                <p className="text-3xl font-bold text-blue-600 tracking-tight">50k+</p>
                <p className="text-sm opacity-70">Job Seekers</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href={"/jobs"}>
                <Button
                  size={"lg"}
                  className="text-base px-8 h-12 gap-2 group transition-all"
                >
                  <Search size={18} />
                  Browse Jobs{" "}
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              </Link>

              <Link href={"/about"}>
                <Button
                  size={"lg"}
                  variant={"outline"}
                  className="text-base px-8 h-12 gap-2"
                >
                  <Briefcase size={18} />
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Trust Indication Section */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm pt-4">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span>Free to use</span>
              </div>

              <span className="text-lg">•</span>

              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-blue-500 stroke-[3px]" />
                <span>Verified Employers</span>
              </div>

              <span className="text-lg">•</span>

              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Secure Platform</span>
              </div>
            </div>

          </div>

          {/* Image Section */}
          <div className="flex-1 relative">
            <div className="relative group w-[80%] h-[80%]">
              <div className="absolute -inset-4 bg-blue-400 opacity-20 blur-xl group:hover:opacity-30 transition-opacity">
              </div>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-background">
                  <Image src="/heroSec.png" alt="Hero section image" className="object-cover object-center w-full h-full transform transition-transform duration-500 group-hover:scale-105" width={300} height={300} loading="eager"/>
                </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Hero;
