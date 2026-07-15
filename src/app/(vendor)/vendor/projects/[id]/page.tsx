"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorProjectsApi } from "@/lib/api/vendorProjects";
import { queryKeys } from "@/hooks/queryKeys";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { vendorNavItems } from "@/lib/nav-config";
import { useAuth } from "@/hooks/useAuth";
import { AvailabilityToggle } from "@/components/vendor/AvailabilityToggle";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Calendar, 
  Camera, 
  DollarSign, 
  Phone, 
  Mail, 
  CheckCircle,
  HelpCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch Project Detail query
  const { data: project, isLoading } = useQuery({
    queryKey: queryKeys.vendorProjects.detail(id),
    queryFn: () => vendorProjectsApi.get(id),
    enabled: !!id,
  });

  const shellUser = React.useMemo(() => {
    return {
      name: user?.name || "Vendor Pro",
      email: user?.email || "",
      avatarInitials: user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
        : "VP",
    };
  }, [user]);

  // Fallback Mock Details
  const mockProject = React.useMemo(() => {
    if (project) return project as any;
    return {
      id,
      title: "Luxury Villa Painting & Finishing",
      clientName: "Srinivas Reddy",
      clientPhone: "+91 98480 22338",
      clientEmail: "srinivas.reddy@gmail.com",
      location: "Visakhapatnam, Andhra Pradesh",
      budget: 275000,
      category: "Painting",
      startDate: "2026-05-26T00:00:00Z",
      status: "active",
      sitePhotos: [
        "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=60"
      ],
      milestones: [
        { id: "ms_1", title: "Surface Preparation & Prime Coating", status: "released", amount: 80000, dueDate: "2026-06-02" },
        { id: "ms_2", title: "Core Texture Painting (Main Walls)", status: "pending", amount: 120000, dueDate: "2026-06-10" },
        { id: "ms_3", title: "Inspection & Final Clean Touchups", status: "upcoming", amount: 75000, dueDate: "2026-06-17" }
      ]
    };
  }, [project, id]) as any;

  // Request release mutation
  const releaseMutation = useMutation({
    mutationFn: (milestoneId: string) =>
      vendorProjectsApi.requestMilestoneRelease(id, milestoneId),
    onSuccess: () => {
      toast.success("Milestone release request submitted to client.");
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorProjects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.escrow.all });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to submit release request.");
    }
  });

  // Photo upload mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: (file: File) =>
      vendorProjectsApi.uploadSitePhoto(id, file),
    onSuccess: (newPhotoUrl) => {
      toast.success("Progress site photo uploaded to Cloudinary!");
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorProjects.all });
      
      // Update mock photos array for demonstration purposes
      mockProject.sitePhotos.push(newPhotoUrl);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to upload photo.");
    }
  });

  const handleRequestRelease = (milestoneId: string) => {
    releaseMutation.mutate(milestoneId);
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadPhotoMutation.mutate(file);
  };

  if (isLoading) {
    return (
      <DashboardShell role="vendor" navItems={vendorNavItems} user={shellUser} topbarActions={<AvailabilityToggle />}>
        <div className="space-y-6 animate-pulse">
          <div className="h-6 w-32 bg-white/10 rounded" />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 h-96 bg-white/5 rounded-xl" />
            <div className="h-96 bg-white/5 rounded-xl" />
          </div>
        </div>
      </DashboardShell>
    );
  }

  const releasedSum = mockProject.milestones
    .filter((m: any) => m.status === "released")
    .reduce((sum: number, m: any) => sum + m.amount, 0);

  const pendingSum = mockProject.milestones
    .filter((m: any) => m.status === "pending")
    .reduce((sum: number, m: any) => sum + m.amount, 0);

  return (
    <DashboardShell
      role="vendor"
      navItems={vendorNavItems}
      user={shellUser}
      topbarActions={<AvailabilityToggle />}
    >
      <div className="space-y-6 relative z-10 text-white">
        
        {/* Back Link */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <Link
            href="/vendor/projects"
            className="flex items-center gap-1 font-industrial text-3xs font-bold text-neutral-400 hover:text-white uppercase tracking-widest transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects
          </Link>
          <span className="font-mono text-4xs text-neutral-500">CONTRACT: {id}</span>
        </div>

        {/* Title Specs */}
        <div className="rounded-xl border border-white/6 bg-dark-3 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="bg-orange/10 border border-orange/20 text-orange font-mono font-bold uppercase tracking-wider text-5xs px-2 py-0.5 rounded">
              {(mockProject.category || "").toUpperCase()} CONTRACT
            </span>
            <h2 className="font-body text-xs md:text-sm font-bold">{mockProject.title}</h2>
            <div className="flex items-center gap-1.5 text-4xs text-neutral-400 font-body">
              <MapPin className="h-3.5 w-3.5 text-neutral-500" />
              <span>{mockProject.location}</span>
            </div>
          </div>
          <div className="font-mono text-right">
            <span className="text-5xs text-neutral-500 block uppercase">TOTAL CONTRACT AMOUNT</span>
            <span className="text-orange text-sm md:text-base font-black">₹{mockProject.budget.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Grid split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-6 shadow-xl">
              <h3 className="font-industrial text-xs font-bold tracking-widest text-neutral-400 uppercase border-b border-white/5 pb-2">
                MILESTONE ESCROW TIMELINE
              </h3>

              {/* Custom timeline structure */}
              <div className="relative border-l border-white/10 pl-6 space-y-6 ml-3">
                {mockProject.milestones.map((m: any, idx: number) => {
                  const isReleased = m.status === "released";
                  const isPending = m.status === "pending";
                  const isUpcoming = m.status === "upcoming";

                  return (
                    <div key={m.id} className="relative group">
                      
                      {/* Timeline dot */}
                      <span className={cn(
                        "absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border border-dark-3 flex items-center justify-center shrink-0",
                        isReleased && "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.7)]",
                        isPending && "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)] animate-pulse",
                        isUpcoming && "bg-neutral-800"
                      )} />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-dark-2 border border-white/4 group-hover:border-orange/20 transition-all duration-300">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-5xs font-mono text-neutral-500 uppercase">PHASE {idx+1}</span>
                            <span className={cn(
                              "px-1.5 py-0.2 rounded border text-[8px] font-mono font-bold tracking-wider",
                              isReleased && "bg-green-500/10 text-green-400 border-green-500/20",
                              isPending && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                              isUpcoming && "bg-white/5 text-neutral-400 border-white/5"
                            )}>
                              {isPending ? "AWAITING RELEASE" : m.status.toUpperCase()}
                            </span>
                          </div>
                          <h4 className="font-semibold text-white text-4xs">{m.title}</h4>
                          <span className="text-5xs text-neutral-500 font-body flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Target Completion: {m.dueDate}
                          </span>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-end gap-3 shrink-0">
                          <span className="font-mono text-orange font-bold text-4xs">₹{m.amount.toLocaleString()}</span>
                          
                          {isPending && (
                            <Button
                              size="xs"
                              onClick={() => handleRequestRelease(m.id)}
                              disabled={releaseMutation.isPending}
                              className="bg-orange/10 hover:bg-orange hover:text-white border border-orange/20 text-orange font-industrial font-bold uppercase tracking-wider text-[8px] px-2.5 py-1.5 h-auto transition-all"
                            >
                              Request Release
                            </Button>
                          )}

                          {isReleased && (
                            <span className="text-[8px] text-green-400 font-mono font-bold tracking-wide flex items-center gap-0.5"><CheckCircle className="h-3 w-3" /> Funds Released</span>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          {/* Right Column: Client Card & Site Photos */}
          <div className="space-y-6">
            
            {/* Client Card */}
            <div className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-4 shadow-xl">
              <h3 className="font-industrial text-xs font-bold tracking-widest text-neutral-400 uppercase border-b border-white/5 pb-2">
                CLIENT CONTACT DETAILS
              </h3>

              <div className="space-y-3 font-body text-3xs text-neutral-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-white/5 border border-white/10 shrink-0">
                    <User className="h-4.5 w-4.5 text-orange" />
                  </div>
                  <div>
                    <span className="text-5xs font-mono text-neutral-500 block uppercase">CLIENT NAME</span>
                    <span className="text-white font-bold block">{mockProject.clientName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-white/5 border border-white/10 shrink-0">
                    <Phone className="h-4.5 w-4.5 text-orange" />
                  </div>
                  <div>
                    <span className="text-5xs font-mono text-neutral-500 block uppercase">MOBILE PHONE</span>
                    <span className="text-white font-mono block">{mockProject.clientPhone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-white/5 border border-white/10 shrink-0">
                    <Mail className="h-4.5 w-4.5 text-orange" />
                  </div>
                  <div>
                    <span className="text-5xs font-mono text-neutral-500 block uppercase">EMAIL ADDRESS</span>
                    <span className="text-white font-mono block">{mockProject.clientEmail}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payments Ledger Summary */}
            <div className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-3 shadow-xl">
              <h3 className="font-industrial text-xs font-bold tracking-widest text-neutral-400 uppercase border-b border-white/5 pb-2">
                CONTRACT LEDGER
              </h3>
              
              <div className="space-y-2 text-3xs font-body text-neutral-300">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Total Contract Value</span>
                  <span className="font-mono text-white font-bold">₹{mockProject.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-green-400">
                  <span className="text-green-500/80">Funds Released (Paid)</span>
                  <span className="font-mono font-bold">₹{releasedSum.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-amber-400">
                  <span className="text-amber-500/80">Awaiting Approval (Pending)</span>
                  <span className="font-mono font-bold">₹{pendingSum.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Site Photos Gallery */}
            <div className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h3 className="font-industrial text-xs font-bold tracking-widest text-neutral-400 uppercase">
                  SITE GALLERY
                </h3>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                <button
                  onClick={handleTriggerUpload}
                  disabled={uploadPhotoMutation.isPending}
                  className="text-4xs text-orange font-bold font-industrial uppercase tracking-widest flex items-center gap-0.5 hover:underline"
                >
                  <Camera className="h-3 w-3" /> Upload Photo
                </button>
              </div>

              {mockProject.sitePhotos.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-white/5 rounded bg-dark-2">
                  <span className="text-5xs text-neutral-500 font-body">No progress photos uploaded yet.</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {mockProject.sitePhotos.map((url: string, i: number) => (
                    <div key={i} className="relative rounded overflow-hidden border border-white/5 bg-dark-2 aspect-square">
                      <Image 
                        src={url} 
                        alt={`Progress ${i+1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 200px"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZkZjhmMiIvPjwvc3ZnPg=="
                        className="object-cover opacity-80"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
