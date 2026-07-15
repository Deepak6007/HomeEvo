"use client";

import * as React from "react";
import { useVendorEarnings, useVendorStats } from "@/hooks/vendor/stats";
import { DollarSign, Wallet, ShieldCheck, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const EarningsChart: React.FC = () => {
  const { data: earnings, isLoading: isEarningsLoading } = useVendorEarnings();
  const { data: stats, isLoading: isStatsLoading } = useVendorStats();

  const data = earnings ?? [
    { month: "JAN", amount: 120000 },
    { month: "FEB", amount: 150000 },
    { month: "MAR", amount: 95000 },
    { month: "APR", amount: 180000 },
    { month: "MAY", amount: 210000 },
    { month: "JUN", amount: 185000 }, // Assume June is current month
  ];

  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  // Escrow details from stats or fallback mock
  const pendingPayments = stats?.pendingPayments ?? 45000;
  const escrowBalance = stats?.escrowBalance ?? 135000;

  const currentMonthName = "JUN";

  if (isEarningsLoading || isStatsLoading) {
    return <EarningsChartSkeleton />;
  }

  return (
    <div className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-6 shadow-xl">
      <div className="border-b border-white/5 pb-4">
        <h3 className="font-industrial text-base font-bold tracking-widest text-white uppercase">
          REVENUE OVERVIEW
        </h3>
      </div>

      {/* Pure CSS Bar Chart */}
      <div className="h-48 flex items-end justify-between gap-2 px-2 border-b border-white/5 pb-2">
        {data.map((item, index) => {
          const heightPercentage = Math.round((item.amount / maxAmount) * 100);
          const isCurrent = item.month.toUpperCase() === currentMonthName;

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-dark-4 border border-white/10 rounded-md px-1.5 py-0.5 text-4xs font-mono text-white mb-1 shadow-md">
                ₹{(item.amount / 1000).toFixed(0)}k
              </div>

              {/* Bar */}
              <div 
                className={cn(
                  "w-full rounded-t transition-all duration-500 ease-out origin-bottom",
                  isCurrent 
                    ? "bg-orange shadow-[0_0_15px_rgba(232,93,4,0.5)] hover:shadow-[0_0_20px_rgba(232,93,4,0.7)]" 
                    : "bg-white/10 group-hover:bg-white/20"
                )}
                style={{ height: `${heightPercentage}%`, minHeight: "8px" }}
              />

              {/* Label */}
              <span className={cn(
                "font-mono text-4xs tracking-widest font-bold",
                isCurrent ? "text-orange font-black" : "text-neutral-500"
              )}>
                {item.month}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary Boxes */}
      <div className="grid grid-cols-2 gap-4">
        {/* Pending Card */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex flex-col gap-1 transition-all duration-300 hover:border-amber-500/35">
          <div className="flex items-center gap-1.5 text-neutral-400 text-3xs font-industrial font-bold uppercase tracking-wider">
            <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
            <span>PENDING FUNDS</span>
          </div>
          <span className="font-mono text-base md:text-lg font-bold text-white tracking-tight">
            ₹{pendingPayments.toLocaleString("en-IN")}
          </span>
          <span className="text-4xs text-neutral-500 font-body">Milestones completed, awaiting release.</span>
        </div>

        {/* Escrow Balance Card */}
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 flex flex-col gap-1 transition-all duration-300 hover:border-green-500/35">
          <div className="flex items-center gap-1.5 text-neutral-400 text-3xs font-industrial font-bold uppercase tracking-wider">
            <Wallet className="h-3.5 w-3.5 text-green-500" />
            <span>HELD IN ESCROW</span>
          </div>
          <span className="font-mono text-base md:text-lg font-bold text-white tracking-tight">
            ₹{escrowBalance.toLocaleString("en-IN")}
          </span>
          <span className="text-4xs text-neutral-500 font-body">Secured escrow for active contracts.</span>
        </div>
      </div>
    </div>
  );
};

export const EarningsChartSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-6 animate-pulse">
      <div className="h-4 w-32 bg-white/10 rounded pb-4" />
      <div className="h-48 bg-white/5 rounded" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-20 bg-white/5 rounded" />
        <div className="h-20 bg-white/5 rounded" />
      </div>
    </div>
  );
};

export default EarningsChart;
