"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { vendorPaymentsApi } from "@/lib/api/vendorPayments";
import { vendorProjectsApi } from "@/lib/api/vendorProjects";
import { toast } from "sonner";
import { 
  Gavel, 
  Camera, 
  Send, 
  FileSpreadsheet, 
  ArrowRight 
} from "lucide-react";

export const QuickActionsGrid: React.FC = () => {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Uploading site photo to Cloudinary...");
    try {
      const url = await vendorProjectsApi.uploadSitePhoto("proj_101", file);
      toast.dismiss(toastId);
      toast.success("Progress photo uploaded successfully! Logged on project timeline.");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Failed to upload photo.");
    }
  };

  const handleGenerateInvoice = async () => {
    const toastId = toast.loading("Generating PDF invoice...");
    try {
      const blob = await vendorPaymentsApi.generateInvoice("proj_101", "ms_2");
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Invoice-Milestone-HomeEvo.pdf");
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.dismiss(toastId);
      toast.success("Invoice generated & download started.");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Failed to generate invoice.");
    }
  };

  const actions = [
    {
      title: "Submit Bid",
      subtitle: "Browse matching client leads and submit a quote",
      icon: <Gavel className="h-5 w-5 text-orange" />,
      onClick: () => router.push("/vendor/leads"),
    },
    {
      title: "Upload Site Photos",
      subtitle: "Upload progress photos to active project sites",
      icon: <Camera className="h-5 w-5 text-orange" />,
      onClick: () => fileInputRef.current?.click(),
    },
    {
      title: "Request Payment",
      subtitle: "Notify client to release escrow for a milestone",
      icon: <Send className="h-5 w-5 text-orange" />,
      onClick: () => {
        toast.info("Select 'Request Release' under the Milestone payments panel.");
      },
    },
    {
      title: "Generate Invoice",
      subtitle: "Download official invoice PDF for released items",
      icon: <FileSpreadsheet className="h-5 w-5 text-orange" />,
      onClick: handleGenerateInvoice,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Hidden file input for photo upload quick action */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleUploadPhoto} 
        accept="image/*" 
        className="hidden" 
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((act, i) => (
          <button
            key={i}
            onClick={act.onClick}
            className="text-left rounded-xl border border-white/6 bg-dark-3 p-5 flex items-start gap-4 hover:border-orange/30 hover:-translate-y-1 transition-all duration-300 group shadow-md"
          >
            {/* Tinted icon container */}
            <div className="p-3 rounded-lg bg-orange/5 border border-orange/10 group-hover:border-orange/30 shrink-0 transition-all duration-300">
              {act.icon}
            </div>

            {/* Info details */}
            <div className="space-y-1 flex-1 min-w-0">
              <h4 className="font-industrial text-xs md:text-sm font-bold tracking-widest text-white uppercase flex items-center gap-1 group-hover:text-orange transition-colors">
                {act.title}
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300 text-orange shrink-0" />
              </h4>
              <p className="font-body text-4xs md:text-3xs text-neutral-400 leading-normal">
                {act.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsGrid;
