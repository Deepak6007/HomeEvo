"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useVendorProfile } from "@/hooks/vendor/profile";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const ProfileCompletionCard: React.FC = () => {
  const router = useRouter();
  const { data, isLoading } = useVendorProfile();

  const profile = data?.profile;
  const completionPercentage = data?.completionPercentage ?? 75;

  const tasks = React.useMemo(() => {
    if (!profile) return [];
    return [
      {
        id: "business",
        label: "Business Details",
        isDone: !!(profile.businessName && profile.category),
        section: "/vendor/settings#business",
      },
      {
        id: "aadhaar",
        label: "Aadhaar Verified",
        isDone: !!(profile.aadhaar || (profile as any).aadhaarVerified),
        section: "/vendor/settings#verification",
      },
      {
        id: "gstin",
        label: "GSTIN Registered",
        isDone: !!profile.gstin,
        section: "/vendor/settings#gstin",
      },
      {
        id: "portfolio",
        label: "Portfolio Photos Uploaded",
        isDone: !!(profile.portfolioPhotos && profile.portfolioPhotos.length > 0),
        section: "/vendor/portfolio",
      },
    ];
  }, [profile]);

  const handleTaskClick = (sectionUrl: string, isDone: boolean) => {
    if (!isDone) {
      router.push(sectionUrl);
    }
  };

  if (isLoading) {
    return <ProfileCompletionSkeleton />;
  }

  return (
    <div className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-5 shadow-xl">
      <div className="border-b border-white/5 pb-4">
        <h3 className="font-industrial text-base font-bold tracking-widest text-white uppercase">
          PROFILE INTEGRITY
        </h3>
      </div>

      <div className="flex items-center gap-4">
        <span className="font-mono text-4xl font-extrabold text-orange tracking-tight shrink-0 select-none">
          {completionPercentage}%
        </span>
        <div className="space-y-0.5">
          <h4 className="font-body text-xs font-semibold text-white">
            Complete your profile
          </h4>
          <p className="font-body text-4xs text-neutral-400 leading-normal">
            Verified profiles with rich portfolios receive up to 5x more lead inquiries.
          </p>
        </div>
      </div>

      {/* Task Checklist */}
      <div className="space-y-2.5">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => handleTaskClick(task.section, task.isDone)}
            className={cn(
              "p-3 rounded-lg border border-white/4 bg-dark-2 flex items-center justify-between transition-all duration-300 font-body text-3xs",
              task.isDone 
                ? "text-neutral-400 border-white/4" 
                : "text-white cursor-pointer hover:border-orange/20 hover:bg-dark-4 group"
            )}
          >
            <div className="flex items-center gap-2">
              {task.isDone ? (
                <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-neutral-600 group-hover:text-orange shrink-0 transition-colors" />
              )}
              <span className={cn(task.isDone ? "line-through text-neutral-500" : "font-medium")}>
                {task.label}
              </span>
            </div>
            
            {!task.isDone && (
              <span className="font-industrial text-4xs text-orange font-bold uppercase tracking-widest flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0">
                Fix <ArrowRight className="h-3 w-3" />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProfileCompletionSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-4 animate-pulse">
      <div className="h-4 w-32 bg-white/10 rounded pb-4" />
      <div className="flex items-center gap-4">
        <div className="h-10 w-16 bg-white/10 rounded" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-white/10 rounded" />
          <div className="h-3 bg-white/10 rounded" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 bg-white/5 rounded border border-white/5" />
        ))}
      </div>
    </div>
  );
};

export default ProfileCompletionCard;
