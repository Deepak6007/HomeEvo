"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { vendorPaymentsApi } from "@/lib/api/vendorPayments";
import { queryKeys } from "@/hooks/queryKeys";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { vendorNavItems } from "@/lib/nav-config";
import { useAuth } from "@/hooks/useAuth";
import { AvailabilityToggle } from "@/components/vendor/AvailabilityToggle";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  IndianRupee, 
  Download, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  FileSpreadsheet,
  Wallet,
  TrendingUp,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function PaymentsPage() {
  const { user } = useAuth();

  // Filters State
  const [dateRange, setDateRange] = React.useState({ start: "", end: "" });
  const [page, setPage] = React.useState(1);

  // Queries
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: queryKeys.vendorStats.all,
    queryFn: () => vendorPaymentsApi.getStats(),
  });

  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: [...queryKeys.escrow.all, "history", page],
    queryFn: () => vendorPaymentsApi.getHistory({ page }),
  });

  const stats = statsData ?? {
    totalEarnings: 685000,
    monthlyEarnings: 185000,
    pendingPayments: 45000,
    escrowBalance: 135000
  };

  const payments = (historyData?.data as any) ?? [
    // Fallback Mock Transactions
    { id: "tx_1", createdAt: "2026-05-28T09:00:00Z", projectName: "Luxury Villa Painting & Finishing", milestoneName: "Initial Surface Preparation", amount: 80000, status: "released", milestoneId: "ms_1", projectId: "proj_101" },
    { id: "tx_2", createdAt: "2026-05-30T16:30:00Z", projectName: "Guntur Residential Construction", milestoneName: "Wall Plastering Stage 1", amount: 45000, status: "pending", milestoneId: "ms_4", projectId: "proj_102" },
    { id: "tx_3", createdAt: "2026-05-25T11:00:00Z", projectName: "Modular Kitchen Cabinet Woodworking", milestoneName: "Acrylic Panel Laminates", amount: 135000, status: "released", milestoneId: "ms_5", projectId: "proj_103" },
    { id: "tx_4", createdAt: "2026-06-01T10:00:00Z", projectName: "Luxury Villa Painting & Finishing", milestoneName: "Core Exterior Texture Coating", amount: 120000, status: "escrow", milestoneId: "ms_2", projectId: "proj_101" },
    { id: "tx_5", createdAt: "2026-06-15T00:00:00Z", projectName: "Luxury Villa Painting & Finishing", milestoneName: "Final Clean & Inspection", amount: 75000, status: "upcoming", milestoneId: "ms_3", projectId: "proj_101" }
  ];

  // Past 12 Months mock data for the chart
  const mockChartData = [
    { month: "JUL", amount: 45000 },
    { month: "AUG", amount: 60000 },
    { month: "SEP", amount: 35000 },
    { month: "OCT", amount: 80000 },
    { month: "NOV", amount: 95000 },
    { month: "DEC", amount: 110000 },
    { month: "JAN", amount: 120000 },
    { month: "FEB", amount: 150000 },
    { month: "MAR", amount: 95000 },
    { month: "APR", amount: 180000 },
    { month: "MAY", amount: 210000 },
    { month: "JUN", amount: 185000 }, // Current month highlighted
  ];

  const maxChartAmt = Math.max(...mockChartData.map(d => d.amount), 1);

  // Client-Side Row Filtering by Date
  const filteredPayments = React.useMemo(() => {
    let list = [...payments];
    if (dateRange.start) {
      list = list.filter(p => new Date(p.createdAt) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      list = list.filter(p => new Date(p.createdAt) <= new Date(dateRange.end));
    }
    return list;
  }, [payments, dateRange]);

  const handleDownloadInvoice = async (projectId: string, milestoneId: string) => {
    const toastId = toast.loading("Generating PDF Invoice...");
    try {
      const blob = await vendorPaymentsApi.generateInvoice(projectId, milestoneId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice-${projectId}-${milestoneId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.dismiss(toastId);
      toast.success("Invoice PDF downloaded.");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Failed to generate invoice.");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Project", "MilestoneName", "Amount(INR)", "Status"];
    const rows = filteredPayments.map(p => [
      new Date(p.createdAt).toLocaleDateString("en-IN"),
      p.projectName.replace(/,/g, " "),
      p.milestoneName.replace(/,/g, " "),
      p.amount,
      p.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "HomeEvo_Vendor_Payments_History.csv");
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    toast.success("CSV export downloaded successfully!");
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === "released" || s === "paid") {
      return { text: "text-green-400 bg-green-500/5 border-green-500/20", label: "RELEASED" };
    }
    if (s === "pending" || s === "requested") {
      return { text: "text-amber-500 bg-amber-500/5 border-amber-500/20", label: "PENDING APPROVAL" };
    }
    if (s === "escrow" || s === "held") {
      return { text: "text-blue-400 bg-blue-500/5 border-blue-500/20", label: "IN ESCROW" };
    }
    return { text: "text-neutral-500 bg-white/2 border-white/5", label: "UPCOMING" };
  };

  const shellUser = React.useMemo(() => {
    return {
      name: user?.name || "Vendor Pro",
      email: user?.email || "",
      avatarInitials: user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
        : "VP",
    };
  }, [user]);

  return (
    <DashboardShell
      role="vendor"
      navItems={vendorNavItems}
      user={shellUser}
      topbarActions={<AvailabilityToggle />}
    >
      <div className="space-y-6 relative z-10 text-white">
        
        {/* Title */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="space-y-1">
            <h1 className="font-industrial text-2xl font-bold tracking-wider uppercase text-white">
              PAYMENTS LEDGER & FINANCIALS
            </h1>
            <p className="font-body text-3xs text-neutral-400">
              Monitor total earnings, pending approvals, and active milestone escrows.
            </p>
          </div>
        </div>

        {/* 4 Summary Cards */}
        {isStatsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-white/5 rounded-xl border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Earned */}
            <div className="rounded-xl border border-white/6 bg-dark-3 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-industrial text-5xs font-bold text-neutral-500 uppercase tracking-widest">TOTAL EARNED</span>
                <IndianRupee className="h-4 w-4 text-green-400" />
              </div>
              <span className="font-mono text-base md:text-lg font-black text-white mt-2">
                ₹{stats.totalEarnings.toLocaleString("en-IN")}
              </span>
            </div>

            {/* This Month */}
            <div className="rounded-xl border border-white/6 bg-dark-3 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-industrial text-5xs font-bold text-neutral-500 uppercase tracking-widest">THIS MONTH</span>
                <TrendingUp className="h-4 w-4 text-orange" />
              </div>
              <span className="font-mono text-base md:text-lg font-black text-white mt-2">
                ₹{stats.monthlyEarnings.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Pending Release */}
            <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-industrial text-5xs font-bold text-neutral-500 uppercase tracking-widest">PENDING RELEASE</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <span className="font-mono text-base md:text-lg font-black text-white mt-2">
                ₹{stats.pendingPayments.toLocaleString("en-IN")}
              </span>
            </div>

            {/* In Escrow */}
            <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-industrial text-5xs font-bold text-neutral-500 uppercase tracking-widest">IN ESCROW VAULT</span>
                <Wallet className="h-4 w-4 text-blue-400" />
              </div>
              <span className="font-mono text-base md:text-lg font-black text-white mt-2">
                ₹{stats.escrowBalance.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        )}

        {/* 12-Month CSS Chart */}
        <div className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-4">
          <h3 className="font-industrial text-xs font-bold tracking-widest text-neutral-400 uppercase">
            12-MONTH REVENUE TIMELINE
          </h3>
          <div className="h-32 flex items-end justify-between gap-1 border-b border-white/5 pb-2 px-1">
            {mockChartData.map((d, i) => {
              const pct = Math.round((d.amount / maxChartAmt) * 100);
              const isCurrent = d.month === "JUN";

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group h-full justify-end">
                  <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -translate-y-8 bg-dark-4 border border-white/10 rounded px-1 text-[8px] font-mono text-white shadow transition-all">
                    ₹{(d.amount / 1000).toFixed(0)}k
                  </div>
                  <div 
                    className={cn(
                      "w-full rounded-t transition-all duration-300",
                      isCurrent ? "bg-orange shadow-[0_0_10px_rgba(232,93,4,0.4)]" : "bg-white/5 group-hover:bg-white/15"
                    )}
                    style={{ height: `${pct}%`, minHeight: "4px" }}
                  />
                  <span className={cn("text-[8px] font-mono", isCurrent ? "text-orange font-bold" : "text-neutral-500")}>
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transactions Table Section */}
        <div className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-5 shadow-xl">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <h3 className="font-industrial text-xs font-bold tracking-widest text-neutral-400 uppercase flex items-center gap-1">
              <FileSpreadsheet className="h-4 w-4 text-orange" /> TRANSACTION HISTORY
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              {/* Date Filters */}
              <div className="flex items-center gap-1.5 text-4xs font-mono text-neutral-400">
                <span>FROM:</span>
                <input 
                  type="date" 
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="bg-dark-2 border border-white/10 rounded px-2 py-1 text-4xs text-white outline-none focus:border-orange"
                />
                <span>TO:</span>
                <input 
                  type="date" 
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="bg-dark-2 border border-white/10 rounded px-2 py-1 text-4xs text-white outline-none focus:border-orange"
                />
              </div>

              {/* CSV button */}
              <Button
                size="xs"
                onClick={handleExportCSV}
                className="border border-white/5 hover:border-orange/20 hover:bg-white/5 text-white font-industrial font-bold uppercase tracking-wider text-4xs flex items-center gap-1 h-8 rounded px-2.5"
              >
                <Download className="h-3 w-3 text-orange" /> Export CSV
              </Button>
            </div>
          </div>

          {/* Table */}
          {isHistoryLoading ? (
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-white/5 rounded border border-white/5" />
              ))}
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/5 rounded-xl bg-dark-2">
              <span className="text-3xs text-neutral-400 font-body">No transactions match your query parameters.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/5 font-industrial text-4xs tracking-widest text-neutral-500 font-bold uppercase">
                    <th className="pb-3 pl-2">Date</th>
                    <th className="pb-3">Project Title</th>
                    <th className="pb-3">Milestone Name</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-right">Status</th>
                    <th className="pb-3 text-right pr-2">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-3xs font-body text-neutral-300">
                  {filteredPayments.map((p) => {
                    const status = getStatusColor(p.status);
                    const formattedDate = new Date(p.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    });

                    return (
                      <tr key={p.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-4 pl-2 font-mono text-neutral-400">{formattedDate}</td>
                        <td className="py-4 font-semibold text-white">{p.projectName}</td>
                        <td className="py-4 text-neutral-400">{p.milestoneName}</td>
                        <td className="py-4 text-right font-mono font-bold text-orange text-2xs">
                          ₹{p.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-4 text-right">
                          <span className={cn("px-2 py-0.5 rounded border text-[8px] font-mono font-bold tracking-wider", status.text)}>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-2">
                          {((p.status === "released" || p.status === "paid") && p.milestoneId) ? (
                            <button
                              onClick={() => handleDownloadInvoice(p.projectId, p.milestoneId!)}
                              className="text-4xs text-orange font-bold font-industrial uppercase tracking-widest flex items-center gap-0.5 justify-end w-full hover:underline"
                            >
                              <Download className="h-3 w-3 shrink-0" /> PDF Invoice
                            </button>
                          ) : (
                            <span className="text-neutral-500 font-mono text-4xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table pagination UI */}
          <div className="flex items-center justify-between border-t border-white/5 pt-4 text-4xs font-mono text-neutral-400">
            <span>Page {page} of 1</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="border border-white/5 hover:bg-white/5 h-8 w-8 text-neutral-400"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={true} // Simple single page mock
                onClick={() => setPage(page + 1)}
                className="border border-white/5 hover:bg-white/5 h-8 w-8 text-neutral-400"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
