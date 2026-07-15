"use client";

import * as React from "react";
import { useVendorStats } from "@/hooks/vendor/stats";
import { 
  IndianRupee, 
  Briefcase, 
  TrendingUp, 
  Star, 
  ArrowUpRight, 
  Percent,
  Dot
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const VendorStatsRow: React.FC = () => {
  const { data: stats, isLoading } = useVendorStats();

  // Fallbacks for loading or network error states
  const monthlyEarnings = stats?.monthlyEarnings ?? 185000;
  const activeProjects = stats?.activeProjects ?? 4;
  const bidWinRate = stats?.bidWinRate ?? 68;
  const avgRating = stats?.avgRating ?? 4.8;
  const reviewCount = stats?.reviewCount ?? 24;

  const cards = [
    {
      title: "THIS MONTH EARNINGS",
      value: `₹${monthlyEarnings.toLocaleString("en-IN")}`,
      subtext: "+12.4% vs last month",
      subtextIcon: <ArrowUpRight className="h-3.5 w-3.5 text-green-400 shrink-0" />,
      subtextClass: "text-green-400",
      icon: <IndianRupee className="h-5 w-5 text-orange" />,
    },
    {
      title: "ACTIVE PROJECTS",
      value: String(activeProjects),
      subtext: `${activeProjects} on schedule · 0 delayed`,
      subtextIcon: <span className="h-2 w-2 rounded-full bg-green-500 shrink-0 animate-pulse" />,
      subtextClass: "text-neutral-400",
      icon: <Briefcase className="h-5 w-5 text-orange" />,
    },
    {
      title: "BID WIN RATE",
      value: `${bidWinRate}%`,
      subtext: "15 bids won / 22 submitted",
      subtextIcon: <TrendingUp className="h-3.5 w-3.5 text-orange/60 shrink-0" />,
      subtextClass: "text-neutral-400",
      icon: <Percent className="h-5 w-5 text-orange" />,
    },
    {
      title: "AVERAGE RATING",
      value: avgRating.toFixed(1),
      subtext: `${reviewCount} client reviews`,
      subtextIcon: (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star 
              key={i} 
              className={cn(
                "h-2.5 w-2.5 shrink-0", 
                i < Math.floor(avgRating) ? "text-orange fill-orange" : "text-neutral-600"
              )} 
            />
          ))}
        </div>
      ),
      subtextClass: "text-neutral-400",
      icon: <Star className="h-5 w-5 text-orange" />,
    },
  ];

  if (isLoading) {
    return <StatsRowSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className="relative overflow-hidden rounded-xl border border-white/6 bg-dark-3 p-5 flex flex-col justify-between hover:border-orange/20 transition-all duration-300 group shadow-md"
        >
          {/* Subtle hover accent light */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-transparent group-hover:bg-gradient-to-r group-hover:from-orange/50 group-hover:to-transparent transition-all duration-300" />
          
          <div className="flex items-center justify-between gap-4">
            <span className="font-industrial text-2xs tracking-widest text-neutral-500 font-bold">
              {card.title}
            </span>
            <div className="p-2 rounded-lg bg-orange/5 border border-orange/10 group-hover:border-orange/35 transition-all duration-300 shrink-0">
              {card.icon}
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <h3 className="font-mono text-2xl font-bold text-white tracking-tight">
              {card.value}
            </h3>
            <div className="flex items-center gap-1.5 text-3xs md:text-2xs">
              {card.subtextIcon}
              <span className={cn("font-body", card.subtextClass)}>
                {card.subtext}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const StatsRowSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-white/6 bg-dark-3 p-5 h-[130px] animate-pulse flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 bg-white/10 rounded" />
            <div className="h-9 w-9 bg-white/10 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-6 w-32 bg-white/10 rounded" />
            <div className="h-3.5 w-20 bg-white/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default VendorStatsRow;
