"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useVendorProfile, useUpdateVendorProfile } from "@/hooks";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { vendorNavItems } from "@/lib/nav-config";
import { useAuth } from "@/hooks/useAuth";
import { AvailabilityToggle } from "@/components/vendor/AvailabilityToggle";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/authStore";
import { 
  User, 
  Briefcase, 
  Bell, 
  Shield, 
  Landmark, 
  Loader2, 
  Save,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

// Zod Validation Schemas
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian phone number (e.g. 9876543210)"),
  email: z.string().email("Invalid email address"),
});

const businessSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  category: z.string().min(2, "Category is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  gstin: z.string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format (15 characters, e.g. 37AAAAA1111A1Z1)")
    .or(z.literal("")),
  aadhaar: z.string()
    .regex(/^\d{12}$/, "Aadhaar must be a 12-digit number")
    .or(z.literal("")),
});

const notificationsSchema = z.object({
  newLeadsNotification: z.boolean(),
  bidUpdatesNotification: z.boolean(),
  paymentAlertsNotification: z.boolean(),
  weeklyReportNotification: z.boolean(),
});

const securitySchema = z.object({
  currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const billingSchema = z.object({
  bankName: z.string().min(2, "Bank name is required"),
  bankAccountNumber: z.string().regex(/^\d{9,18}$/, "Bank account number must be between 9 and 18 digits"),
  bankIfscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code (11 characters, e.g. SBIN0001234)"),
});

type TabType = "profile" | "business" | "notifications" | "security" | "billing";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<TabType>("profile");

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error("File size must be less than 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (user) {
        useAuthStore.getState().setUser({
          ...user,
          avatarUrl: base64String,
        });
        toast.success("Profile picture updated!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    if (user) {
      useAuthStore.getState().setUser({
        ...user,
        avatarUrl: undefined,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.success("Profile picture removed!");
    }
  };

  // Fetch Vendor Profile
  const { data: profileResponse, isLoading } = useVendorProfile();
  const profile = profileResponse?.profile;

  // Mutation
  const updateProfileMutation = useUpdateVendorProfile();

  // Change Password Mock Mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { success: true };
    },
    onSuccess: () => {
      toast.success("Password changed successfully!");
      securityForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    },
    onError: () => {
      toast.error("Failed to change password. Please verify current password.");
    }
  });

  // Forms Initialization
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", phone: "", email: "" },
  });

  const businessForm = useForm<z.infer<typeof businessSchema>>({
    resolver: zodResolver(businessSchema),
    defaultValues: { businessName: "", category: "", description: "", gstin: "", aadhaar: "" },
  });

  const notificationsForm = useForm<z.infer<typeof notificationsSchema>>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      newLeadsNotification: true,
      bidUpdatesNotification: true,
      paymentAlertsNotification: true,
      weeklyReportNotification: false,
    },
  });

  const securityForm = useForm<z.infer<typeof securitySchema>>({
    resolver: zodResolver(securitySchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const billingForm = useForm<z.infer<typeof billingSchema>>({
    resolver: zodResolver(billingSchema),
    defaultValues: { bankName: "", bankAccountNumber: "", bankIfscCode: "" },
  });

  // Prefill forms when data is loaded
  React.useEffect(() => {
    if (profile) {
      profileForm.reset({
        name: profile.name || user?.name || "",
        phone: user?.phone || "",
        email: user?.email || "",
      });
      businessForm.reset({
        businessName: profile.businessName || "",
        category: profile.category || "",
        description: profile.description || "",
        gstin: profile.gstin || "",
        aadhaar: profile.aadhaar || "",
      });
      notificationsForm.reset({
        newLeadsNotification: profile.newLeadsNotification ?? true,
        bidUpdatesNotification: profile.bidUpdatesNotification ?? true,
        paymentAlertsNotification: profile.paymentAlertsNotification ?? true,
        weeklyReportNotification: profile.weeklyReportNotification ?? false,
      });
      billingForm.reset({
        bankName: profile.bankName || "",
        bankAccountNumber: profile.bankAccountNumber || "",
        bankIfscCode: profile.bankIfscCode || "",
      });
    }
  }, [profile, user, profileForm, businessForm, notificationsForm, billingForm]);

  // Form Submit Handlers
  const onProfileSubmit = (values: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Profile details updated!");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update profile.");
      }
    });
  };

  const onBusinessSubmit = (values: z.infer<typeof businessSchema>) => {
    updateProfileMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Business profile updated!");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update business settings.");
      }
    });
  };

  const onNotificationsSubmit = (values: z.infer<typeof notificationsSchema>) => {
    updateProfileMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Notification preferences saved!");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to save notification settings.");
      }
    });
  };

  const onSecuritySubmit = (values: z.infer<typeof securitySchema>) => {
    changePasswordMutation.mutate(values);
  };

  const onBillingSubmit = (values: z.infer<typeof billingSchema>) => {
    updateProfileMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Bank details updated successfully!");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update bank details.");
      }
    });
  };

  const shellUser = React.useMemo(() => {
    return {
      name: user?.name || "Vendor Pro",
      email: user?.email || "",
      avatarInitials: user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
        : "VP",
      avatarUrl: user?.avatarUrl,
    };
  }, [user]);

  const tabsList = [
    { id: "profile", label: "PROFILE DETAIL", icon: User },
    { id: "business", label: "BUSINESS ENTITY", icon: Briefcase },
    { id: "notifications", label: "NOTIFICATIONS", icon: Bell },
    { id: "security", label: "SECURITY & ACCESS", icon: Shield },
    { id: "billing", label: "BANK SETTLEMENT", icon: Landmark },
  ] as const;

  return (
    <DashboardShell
      role="vendor"
      navItems={vendorNavItems}
      user={shellUser}
      topbarActions={<AvailabilityToggle />}
    >
      <div className="space-y-6 relative z-10 text-white">
        
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="space-y-1">
            <h1 className="font-industrial text-2xl font-bold tracking-wider uppercase text-white">
              ACCOUNT SETTINGS
            </h1>
            <p className="font-body text-3xs text-neutral-400">
              Configure personal profile detail, commercial credentials, notification rules, and payout routing.
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Sidebar Tab Buttons */}
          <div className="md:col-span-1 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 select-none">
            {tabsList.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-3 rounded text-left transition-all duration-150 shrink-0 font-industrial tracking-wider text-4xs font-bold border-l-2",
                    isActive 
                      ? "border-orange bg-orange/5 text-orange" 
                      : "border-transparent text-neutral-400 hover:text-white hover:bg-white/2"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content Area */}
          <div className="md:col-span-3">
            {isLoading ? (
              <div className="rounded-xl border border-white/6 bg-dark-3 p-12 text-center flex flex-col items-center justify-center space-y-3">
                <Loader2 className="h-6 w-6 text-orange animate-spin" />
                <span className="font-mono text-3xs text-neutral-400 uppercase tracking-widest">LOADING SETTINGS PANEL...</span>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* 1. Profile Settings Form */}
                {activeTab === "profile" && (
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-5 shadow-xl">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className="font-industrial text-xs font-bold tracking-widest text-white uppercase">
                        PROFILE CONFIGURATION
                      </h3>
                      <p className="font-body text-4xs text-neutral-400">Manage basic contact information associated with your login credentials.</p>
                    </div>

                    {/* Profile Picture (DP) Upload Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-lg bg-white/2 border border-white/5">
                      <Avatar className="h-16 w-16 bg-orange border-2 border-orange/40 shadow-md">
                        {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user?.name || "Vendor"} />}
                        <AvatarFallback className="bg-orange text-white text-base">
                          {shellUser.avatarInitials}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-2 text-center sm:text-left">
                        <h4 className="font-industrial text-4xs font-bold tracking-wider text-neutral-400 uppercase">PROFILE PICTURE (DP)</h4>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-orange hover:bg-orange/90 text-white font-industrial font-bold uppercase tracking-wider text-5xs px-3 py-1.5 rounded shadow-sm transition-all cursor-pointer"
                          >
                            Upload Photo
                          </button>
                          {user?.avatarUrl && (
                            <button
                              type="button"
                              onClick={handleRemoveAvatar}
                              className="bg-transparent hover:bg-red-500/10 text-red-400 border border-red-500/20 font-industrial font-bold uppercase tracking-wider text-5xs px-3 py-1.5 rounded transition-all cursor-pointer"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <p className="font-body text-[10px] text-neutral-500 leading-normal">
                          Supports PNG, JPG, or GIF (Max 3MB).
                        </p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Name input */}
                      <div className="space-y-1.5">
                        <label className="block text-4xs font-industrial font-bold text-neutral-400 tracking-wider">FULL NAME</label>
                        <input 
                          type="text"
                          placeholder="Raju Prasad"
                          {...profileForm.register("name")}
                          className="w-full bg-dark-2 border border-white/10 rounded px-3 py-2 text-sm text-white font-body outline-none focus:border-orange transition-colors"
                        />
                        {profileForm.formState.errors.name && (
                          <p className="text-4xs font-mono text-orange">{profileForm.formState.errors.name.message}</p>
                        )}
                      </div>

                      {/* Phone input (Indian context formatting) */}
                      <div className="space-y-1.5">
                        <label className="block text-4xs font-industrial font-bold text-neutral-400 tracking-wider">CONTACT NUMBER (10 DIGITS)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-neutral-500 font-mono text-sm select-none">+91</span>
                          <input 
                            type="text"
                            placeholder="9876543210"
                            {...profileForm.register("phone", {
                              onChange: (e) => {
                                e.target.value = e.target.value.replace(/\D/g, "");
                              }
                            })}
                            className="w-full bg-dark-2 border border-white/10 rounded pl-11 pr-3 py-2 text-sm text-white font-mono outline-none focus:border-orange transition-colors"
                          />
                        </div>
                        {profileForm.formState.errors.phone && (
                          <p className="text-4xs font-mono text-orange">{profileForm.formState.errors.phone.message}</p>
                        )}
                      </div>

                      {/* Email input (read-only verification flag) */}
                      <div className="space-y-1.5">
                        <label className="block text-4xs font-industrial font-bold text-neutral-400 tracking-wider">EMAIL ADDRESS (PRIMARY IDENTIFIER)</label>
                        <input 
                          type="email"
                          disabled
                          placeholder="raju@carpentry.com"
                          {...profileForm.register("email")}
                          className="w-full bg-dark-1 border border-white/5 rounded px-3 py-2 text-sm text-neutral-500 font-body outline-none cursor-not-allowed select-none"
                        />
                        <p className="text-5xs font-mono text-neutral-500">Contact support to alter primary system identifiers.</p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="bg-orange hover:bg-orange/90 text-white font-industrial font-bold uppercase tracking-wider text-xs px-4 h-9 shadow-md flex items-center gap-1.5"
                      >
                        {updateProfileMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {updateProfileMutation.isPending ? "SAVING..." : "SAVE PROFILE"}
                      </Button>
                    </div>
                  </form>
                )}

                {/* 2. Business Entity Settings Form */}
                {activeTab === "business" && (
                  <form onSubmit={businessForm.handleSubmit(onBusinessSubmit)} className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-5 shadow-xl">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className="font-industrial text-xs font-bold tracking-widest text-white uppercase">
                        BUSINESS PROFILE & REGISTRATION
                      </h3>
                      <p className="font-body text-4xs text-neutral-400">Configure business registry details, specialized category focus, and verified ID info.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Business Name */}
                      <div className="space-y-1.5">
                        <label className="block text-4xs font-industrial font-bold text-neutral-400 tracking-wider">LEGAL BUSINESS NAME</label>
                        <input 
                          type="text"
                          placeholder="Raju Carpentry & Interiors"
                          {...businessForm.register("businessName")}
                          className="w-full bg-dark-2 border border-white/10 rounded px-3 py-2 text-sm text-white font-body outline-none focus:border-orange transition-colors"
                        />
                        {businessForm.formState.errors.businessName && (
                          <p className="text-4xs font-mono text-orange">{businessForm.formState.errors.businessName.message}</p>
                        )}
                      </div>

                      {/* Business Category */}
                      <div className="space-y-1.5">
                        <label className="block text-4xs font-industrial font-bold text-neutral-400 tracking-wider">SPECIALIZATION CATEGORY</label>
                        <select 
                          {...businessForm.register("category")}
                          className="w-full bg-dark-2 border border-white/10 rounded px-3 py-2 text-sm text-white font-body outline-none focus:border-orange transition-colors"
                        >
                          <option value="Carpentry">Carpentry & Woodwork</option>
                          <option value="Electrical">Electrical Works</option>
                          <option value="Plumbing">Plumbing Services</option>
                          <option value="Painting">Painting & Wall Design</option>
                          <option value="Masonry">Masonry & Tiling</option>
                          <option value="Architect">Architectural Consultation</option>
                        </select>
                        {businessForm.formState.errors.category && (
                          <p className="text-4xs font-mono text-orange">{businessForm.formState.errors.category.message}</p>
                        )}
                      </div>

                      {/* GSTIN Registry */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="block text-4xs font-industrial font-bold text-neutral-400 tracking-wider">GSTIN NUMBER (OPTIONAL)</label>
                          {profile?.gstin && (
                            <span className="text-5xs font-mono text-green-400 font-bold bg-green-500/10 px-1 rounded">VERIFIED GSTIN</span>
                          )}
                        </div>
                        <input 
                          type="text"
                          placeholder="37AAAAA1111A1Z1"
                          {...businessForm.register("gstin")}
                          className="w-full bg-dark-2 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono outline-none focus:border-orange transition-colors"
                        />
                        {businessForm.formState.errors.gstin && (
                          <p className="text-4xs font-mono text-orange">{businessForm.formState.errors.gstin.message}</p>
                        )}
                      </div>

                      {/* Aadhaar Registry */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="block text-4xs font-industrial font-bold text-neutral-400 tracking-wider">12-DIGIT AADHAAR CARD (OPTIONAL)</label>
                          {profile?.aadhaar && (
                            <span className="text-5xs font-mono text-green-400 font-bold bg-green-500/10 px-1 rounded">AADHAAR SECURED</span>
                          )}
                        </div>
                        <input 
                          type="text"
                          placeholder="123456789012"
                          {...businessForm.register("aadhaar", {
                            onChange: (e) => {
                              e.target.value = e.target.value.replace(/\D/g, "");
                            }
                          })}
                          className="w-full bg-dark-2 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono outline-none focus:border-orange transition-colors"
                        />
                        {businessForm.formState.errors.aadhaar && (
                          <p className="text-4xs font-mono text-orange">{businessForm.formState.errors.aadhaar.message}</p>
                        )}
                      </div>

                      {/* Description */}
                      <div className="space-y-1.5">
                        <label className="block text-4xs font-industrial font-bold text-neutral-400 tracking-wider">BUSINESS PROFILE OVERVIEW</label>
                        <textarea 
                          rows={4}
                          placeholder="Describe your capabilities, materials used, years of experience, and general timeline parameters..."
                          {...businessForm.register("description")}
                          className="w-full bg-dark-2 border border-white/10 rounded px-3 py-2 text-sm text-white font-body outline-none focus:border-orange transition-colors resize-none leading-relaxed"
                        />
                        {businessForm.formState.errors.description && (
                          <p className="text-4xs font-mono text-orange">{businessForm.formState.errors.description.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="bg-orange hover:bg-orange/90 text-white font-industrial font-bold uppercase tracking-wider text-xs px-4 h-9 shadow-md flex items-center gap-1.5"
                      >
                        {updateProfileMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {updateProfileMutation.isPending ? "SAVING..." : "SAVE BUSINESS INFO"}
                      </Button>
                    </div>
                  </form>
                )}

                {/* 3. Notifications Rules Settings Form */}
                {activeTab === "notifications" && (
                  <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-5 shadow-xl">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className="font-industrial text-xs font-bold tracking-widest text-white uppercase">
                        NOTIFICATION RULES & PREFERENCES
                      </h3>
                      <p className="font-body text-4xs text-neutral-400">Configure real-time event updates via email, SMS, and Ably websocket notifications.</p>
                    </div>

                    <div className="space-y-4 pt-2">
                      {/* Checkbox item 1 */}
                      <label className="flex items-start gap-3 cursor-pointer group py-2 select-none">
                        <input 
                          type="checkbox"
                          {...notificationsForm.register("newLeadsNotification")}
                          className="rounded border-white/10 text-orange bg-dark-2 outline-none focus:ring-orange accent-orange mt-0.5"
                        />
                        <div className="space-y-0.5">
                          <span className="font-industrial text-4xs font-bold tracking-wide text-neutral-300 group-hover:text-white transition-colors uppercase">NEW LEAD ALERTS</span>
                          <p className="font-body text-4xs text-neutral-500 leading-normal">Send instant alerts immediately when a new project matching your category is posted.</p>
                        </div>
                      </label>

                      {/* Checkbox item 2 */}
                      <label className="flex items-start gap-3 cursor-pointer group py-2 select-none">
                        <input 
                          type="checkbox"
                          {...notificationsForm.register("bidUpdatesNotification")}
                          className="rounded border-white/10 text-orange bg-dark-2 outline-none focus:ring-orange accent-orange mt-0.5"
                        />
                        <div className="space-y-0.5">
                          <span className="font-industrial text-4xs font-bold tracking-wide text-neutral-300 group-hover:text-white transition-colors uppercase">BID STATUS UPDATES</span>
                          <p className="font-body text-4xs text-neutral-500 leading-normal">Notify me immediately when a client accepts, rejects, or queries one of my proposals.</p>
                        </div>
                      </label>

                      {/* Checkbox item 3 */}
                      <label className="flex items-start gap-3 cursor-pointer group py-2 select-none">
                        <input 
                          type="checkbox"
                          {...notificationsForm.register("paymentAlertsNotification")}
                          className="rounded border-white/10 text-orange bg-dark-2 outline-none focus:ring-orange accent-orange mt-0.5"
                        />
                        <div className="space-y-0.5">
                          <span className="font-industrial text-4xs font-bold tracking-wide text-neutral-300 group-hover:text-white transition-colors uppercase">ESCROW PAYMENT EVENTS</span>
                          <p className="font-body text-4xs text-neutral-500 leading-normal">Alert when client makes escrow deposits or approves a milestone payout release.</p>
                        </div>
                      </label>

                      {/* Checkbox item 4 */}
                      <label className="flex items-start gap-3 cursor-pointer group py-2 select-none">
                        <input 
                          type="checkbox"
                          {...notificationsForm.register("weeklyReportNotification")}
                          className="rounded border-white/10 text-orange bg-dark-2 outline-none focus:ring-orange accent-orange mt-0.5"
                        />
                        <div className="space-y-0.5">
                          <span className="font-industrial text-4xs font-bold tracking-wide text-neutral-300 group-hover:text-white transition-colors uppercase">WEEKLY DIGEST & STATS</span>
                          <p className="font-body text-4xs text-neutral-500 leading-normal">Receive a consolidated weekly performance digest including earnings graphs and client reviews.</p>
                        </div>
                      </label>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="bg-orange hover:bg-orange/90 text-white font-industrial font-bold uppercase tracking-wider text-xs px-4 h-9 shadow-md flex items-center gap-1.5"
                      >
                        {updateProfileMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {updateProfileMutation.isPending ? "SAVING..." : "SAVE PREFERENCES"}
                      </Button>
                    </div>
                  </form>
                )}

                {/* 4. Security & Access Password Form */}
                {activeTab === "security" && (
                  <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-5 shadow-xl">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className="font-industrial text-xs font-bold tracking-widest text-white uppercase">
                        SECURITY & AUTHENTICATION
                      </h3>
                      <p className="font-body text-4xs text-neutral-400">Alter current login password parameters. Require valid current verification to apply updates.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Current Password */}
                      <div className="space-y-1.5">
                        <label className="block text-4xs font-industrial font-bold text-neutral-400 tracking-wider">CURRENT PASSWORD</label>
                        <input 
                          type="password"
                          placeholder="••••••••"
                          {...securityForm.register("currentPassword")}
                          className="w-full bg-dark-2 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono outline-none focus:border-orange transition-colors"
                        />
                        {securityForm.formState.errors.currentPassword && (
                          <p className="text-4xs font-mono text-orange">{securityForm.formState.errors.currentPassword.message}</p>
                        )}
                      </div>

                      {/* New Password */}
                      <div className="space-y-1.5">
                        <label className="block text-4xs font-industrial font-bold text-neutral-400 tracking-wider">NEW PASSWORD (MIN 6 CHARACTERS)</label>
                        <input 
                          type="password"
                          placeholder="••••••••"
                          {...securityForm.register("newPassword")}
                          className="w-full bg-dark-2 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono outline-none focus:border-orange transition-colors"
                        />
                        {securityForm.formState.errors.newPassword && (
                          <p className="text-4xs font-mono text-orange">{securityForm.formState.errors.newPassword.message}</p>
                        )}
                      </div>

                      {/* Confirm New Password */}
                      <div className="space-y-1.5">
                        <label className="block text-4xs font-industrial font-bold text-neutral-400 tracking-wider">CONFIRM NEW PASSWORD</label>
                        <input 
                          type="password"
                          placeholder="••••••••"
                          {...securityForm.register("confirmPassword")}
                          className="w-full bg-dark-2 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono outline-none focus:border-orange transition-colors"
                        />
                        {securityForm.formState.errors.confirmPassword && (
                          <p className="text-4xs font-mono text-orange">{securityForm.formState.errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                        className="bg-orange hover:bg-orange/90 text-white font-industrial font-bold uppercase tracking-wider text-xs px-4 h-9 shadow-md flex items-center gap-1.5"
                      >
                        {changePasswordMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {changePasswordMutation.isPending ? "UPDATING PASSWORD..." : "UPDATE PASSWORD"}
                      </Button>
                    </div>
                  </form>
                )}

                {/* 5. Billing details (Bank Settlement) */}
                {activeTab === "billing" && (
                  <form onSubmit={billingForm.handleSubmit(onBillingSubmit)} className="rounded-xl border border-white/6 bg-dark-3 p-6 space-y-5 shadow-xl">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className="font-industrial text-xs font-bold tracking-widest text-white uppercase">
                        BANK ACCOUNT SETTLEMENTS
                      </h3>
                      <p className="font-body text-4xs text-neutral-400">Configure bank details to route your Razorpay Escrow release milestone payments.</p>
                    </div>

                    {/* Warning alert notice */}
                    <div className="p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-4xs font-body text-amber-400 leading-relaxed flex items-start gap-2.5">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold">CRITICAL DEPOSIT POLICY:</span>
                        <p>IFSC code and account routing numbers must correspond perfectly with your business GSTIN/Aadhaar holder profile. Erroneous details will freeze escrow payouts.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Bank Name */}
                      <div className="space-y-1.5">
                        <label className="block text-4xs font-industrial font-bold text-neutral-400 tracking-wider">BANK ENTITY NAME</label>
                        <input 
                          type="text"
                          placeholder="State Bank of India"
                          {...billingForm.register("bankName")}
                          className="w-full bg-dark-2 border border-white/10 rounded px-3 py-2 text-sm text-white font-body outline-none focus:border-orange transition-colors"
                        />
                        {billingForm.formState.errors.bankName && (
                          <p className="text-4xs font-mono text-orange">{billingForm.formState.errors.bankName.message}</p>
                        )}
                      </div>

                      {/* Account Number */}
                      <div className="space-y-1.5">
                        <label className="block text-4xs font-industrial font-bold text-neutral-400 tracking-wider">ACCOUNT NUMBER (9-18 DIGITS)</label>
                        <input 
                          type="text"
                          placeholder="123456789012"
                          {...billingForm.register("bankAccountNumber", {
                            onChange: (e) => {
                              e.target.value = e.target.value.replace(/\D/g, "");
                            }
                          })}
                          className="w-full bg-dark-2 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono outline-none focus:border-orange transition-colors"
                        />
                        {billingForm.formState.errors.bankAccountNumber && (
                          <p className="text-4xs font-mono text-orange">{billingForm.formState.errors.bankAccountNumber.message}</p>
                        )}
                      </div>

                      {/* IFSC Code */}
                      <div className="space-y-1.5">
                        <label className="block text-4xs font-industrial font-bold text-neutral-400 tracking-wider">NEFT / IFSC ROUTING CODE</label>
                        <input 
                          type="text"
                          placeholder="SBIN0001234"
                          {...billingForm.register("bankIfscCode")}
                          className="w-full bg-dark-2 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono outline-none focus:border-orange transition-colors uppercase"
                        />
                        {billingForm.formState.errors.bankIfscCode && (
                          <p className="text-4xs font-mono text-orange">{billingForm.formState.errors.bankIfscCode.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="bg-orange hover:bg-orange/90 text-white font-industrial font-bold uppercase tracking-wider text-xs px-4 h-9 shadow-md flex items-center gap-1.5"
                      >
                        {updateProfileMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {updateProfileMutation.isPending ? "SAVING ROUTING..." : "SAVE BANK DETAILS"}
                      </Button>
                    </div>
                  </form>
                )}

              </div>
            )}
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
