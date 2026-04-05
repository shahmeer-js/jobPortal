"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/context/AppContext";
import { AccountProps } from "@/type";
import { Award, Loader, PlusIcon, Sparkles, X } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

const Skills: React.FC<AccountProps> = ({ user, isYourAccount }) => {
  const { addSkill, removeSkill, btnLoading } = useAppData();
  const [skill, setSkill] = useState("");

  const addSkillHandler = () => {
    if (!skill.trim()) {
      toast.error("Please provide skill to add ");
      return;
    }
    addSkill(skill, setSkill);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addSkillHandler();
    }
  };

  const removeSkillHandler = (skillToRemove: string) => {
    if (
      confirm(`Are you sure you want to remove the ${skillToRemove} skill?`)
    ) {
      removeSkill(skillToRemove);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 ">
      <Card className="shadow-lg border-2 overflow-hidden">
        <div className="bg-blue-500 p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Award size={20} className="text-blue-600 dark:text-white" />
            </div>
            <CardTitle className="text-2xl text-white">
              {isYourAccount ? "Your Skills" : "User Skills"}
            </CardTitle>
            {isYourAccount && (
              <CardDescription className="text-sm mt-1 text-white">
                Showcase your expertise and abilities
              </CardDescription>
            )}
          </div>
        </div>

        {/* Add skills input */}
        {isYourAccount && (
          <div className="flex gap-3 flex-col sm:flex-row p-2">
            <div className="relative flex-1">
              <Sparkles
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
              />
              <Input
                type="text"
                placeholder="e.g. React, Node.js Python..."
                className="h-11 pl-10 bg-background"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button
              onClick={addSkillHandler}
              className="h-11 gap-2 px-6"
              disabled={btnLoading || !skill.trim()}
            >
              {btnLoading ? (
                <>
                  <Loader className="animate-spin" /> Adding
                </>
              ) : (
                <>
                  <PlusIcon size={18} /> Add Skills
                </>
              )}
            </Button>
          </div>
        )}

        {/* Skills Display */}
        <CardContent className="p-6">
          {user.skills && user.skills.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {user.skills.map((element, index) => (
                <div
                  key={index}
                  className="pl-4 pr-3 py-2 group relative inline-flex items-center gap-2 border-2 rounded-full hover:shadow-sm duration-200 transition-all"
                >
                  <span className="font-medium text-sm">{element}</span>
                  {isYourAccount && (
                    <button
                      onClick={() => removeSkillHandler(element)}
                      className="h-6 w-6 rounded-full text-red-500 flex items-center justify-center transition-all hover:bg-red-600 hover:scale-110 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <>
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Award size={32} className="opacity-40" />
              </div>
              <CardDescription className="text-base">
               {
                isYourAccount ? " No Skills Added Yet. Start building your profile!" : "No Skills added by user"
               }
              </CardDescription>
            </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Skills;
