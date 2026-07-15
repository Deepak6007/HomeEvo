"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useLeads } from "@/hooks/vendor/leads";
import { useBids } from "@/hooks/vendor/bids";
import { useVendorStats } from "@/hooks/vendor/stats";

export const VendorWelcomeBanner: React.FC = () => {
  const { user } = useAuth();
  const { data: leadsData } = useLeads({ status: "new", pageSize: 5 });
  const { data: bidsData } = useBids({ status: "pending" });
  const { data: statsData } = useVendorStats();

  const firstName = user?.name ? user.name.split(" ")[0].toUpperCase() : "RAJU";
  const newLeadsCount = leadsData?.pagination?.total ?? 7;
  const pendingBidsCount = bidsData?.pagination?.total ?? 3;
  const pendingEarnings = statsData?.pendingPayments ?? 45000;

  // Simple time of day greeting
  const greeting = (() => {
    const hr = new Date().getHours();
    if (hr < 12) return "MORNING";
    if (hr < 17) return "AFTERNOON";
    return "EVENING";
  })();

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/6 bg-dark-2 p-6 md:p-8 min-h-[200px] flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-2xl">
      {/* Background diagonal stripe pattern */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none" 
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, #000, #000 10px, transparent 10px, transparent 20px)"
        }}
      />

      {/* Blueprint style grid lines overlay */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(232,93,4,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(232,93,4,0.1) 1px, transparent 1px)",
          backgroundSize: "20px 20px"
        }}
      />

      {/* Right-side radial orange glow */}
      <div className="absolute right-0 top-0 h-full w-[350px] bg-[radial-gradient(circle_at_right,_rgba(232,93,4,0.18)_0%,_transparent_70%)] pointer-events-none" />

      {/* Left content container */}
      <div className="relative z-10 space-y-3 max-w-xl">
        <h1 className="font-industrial text-3xl md:text-4xl font-black tracking-wide text-white leading-tight">
          {greeting}, {firstName}. <span className="text-orange">{newLeadsCount} NEW LEADS</span> WAITING.
        </h1>
        <p className="font-body text-xs md:text-sm text-neutral-400 leading-relaxed">
          You currently have <span className="text-white font-semibold">{pendingBidsCount} pending bids</span> under review. 
          There is an estimated <span className="text-orange font-mono font-bold">₹{pendingEarnings.toLocaleString("en-IN")}</span> in upcoming milestone payments awaiting release requests.
        </p>
      </div>

      {/* Right action buttons */}
      <div className="relative z-10 shrink-0 flex flex-row md:flex-col lg:flex-row gap-3">
        <Link 
          href="/vendor/leads" 
          className="bg-orange hover:bg-orange/90 text-white font-industrial font-bold uppercase tracking-wider text-xs px-6 py-3.5 rounded-md shadow-[0_0_15px_rgba(232,93,4,0.3)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(232,93,4,0.5)] flex items-center justify-center min-w-[120px]"
        >
          View Leads
        </Link>
        <Link 
          href="/vendor/leads" 
          className="border border-white/10 hover:border-orange/30 text-white hover:bg-white/5 font-industrial font-bold uppercase tracking-wider text-xs px-6 py-3.5 rounded-md transition-all duration-300 flex items-center justify-center min-w-[120px]"
        >
          Submit New Bid
        </Link>
      </div>
    </div>
  );
};

export default VendorWelcomeBanner;
