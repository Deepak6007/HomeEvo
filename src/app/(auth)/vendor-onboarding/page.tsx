"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Image as ImageIcon, Briefcase, FileText, Flame } from "lucide-react"
import { authApi } from "@/lib/api"
import { useAuthStore } from "@/stores/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileUpload } from "@/components/shared/FileUpload"
import { Progress } from "@/components/ui/progress"

const VENDOR_CATEGORIES = [
  "General Contractor",
  "Electrician",
  "Plumber",
  "Masonry Specialist",
  "Architect",
  "Interior Designer",
  "Painter",
  "Carpenter",
  "Flooring Expert",
  "Material Vendor",
]

const AP_CITIES = [
  "Visakhapatnam",
  "Vijayawada",
  "Guntur",
  "Nellore",
  "Kurnool",
  "Tirupati",
  "Rajamahendravaram",
  "Kakinada",
  "Kadapa",
  "Anantapur",
  "Eluru",
  "Ongole",
  "Vizianagaram",
]

// Zod Validation Schemas for Onboarding Steps
const step1Schema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  category: z.string().min(1, "Primary work category is required"),
  experience: z.coerce.number().min(0, "Years of experience must be at least 0"),
  serviceAreas: z.array(z.string()).min(1, "Select at least one service area in Andhra Pradesh"),
})

const step2Schema = z.object({
  aadhaar: z.string().regex(/^\d{12}$/, "Aadhaar must be exactly 12 digits"),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format (15 characters standard ID)").or(z.literal("").or(z.undefined())),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

export default function VendorOnboardingPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  const [step, setStep] = React.useState(1)
  const [docFiles, setDocFiles] = React.useState<File[]>([])
  const [portfolioFiles, setPortfolioFiles] = React.useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Step 1 Form
  const {
    register: reg1,
    handleSubmit: handleSub1,
    setValue: setVal1,
    watch: watch1,
    formState: { errors: err1 },
  } = useForm<Step1Data>({
    defaultValues: {
      businessName: user?.name ? `${user.name} Contractors` : "",
      category: "",
      experience: 1,
      serviceAreas: [],
    },
  })

  // Step 2 Form
  const {
    register: reg2,
    handleSubmit: handleSub2,
    formState: { errors: err2 },
  } = useForm<Step2Data>({
    defaultValues: {
      aadhaar: "",
      gstin: "",
    },
  })

  // Watch service areas for custom checkbox list
  const selectedAreas = watch1("serviceAreas") || []

  const toggleServiceArea = (city: string) => {
    if (selectedAreas.includes(city)) {
      setVal1(
        "serviceAreas",
        selectedAreas.filter((c) => c !== city)
      )
    } else {
      setVal1("serviceAreas", [...selectedAreas, city])
    }
  }

  // Handle Next for Step 1
  const onNextStep1 = (data: Step1Data) => {
    try {
      step1Schema.parse(data)
      setStep(2)
    } catch (err: any) {
      toast.error("Please fill all step 1 details correctly.")
    }
  }

  // Handle Next for Step 2
  const onNextStep2 = (data: Step2Data) => {
    try {
      step2Schema.parse(data)
      if (docFiles.length === 0) {
        toast.error("Please upload at least one verification document (e.g. Aadhaar copy).")
        return
      }
      setStep(3)
    } catch (err: any) {
      toast.error("Please provide a valid 12-digit Aadhaar number.")
    }
  }

  // Handle Final Submit for Step 3
  const handleFinalSubmit = async () => {
    if (portfolioFiles.length < 3) {
      toast.error("Please upload at least 3 portfolio project photos.")
      return
    }

    setIsSubmitting(true)
    try {
      // Run form parses to get clean data values
      let step1Val: Step1Data
      let step2Val: Step2Data

      // We handle the values from forms
      const values1 = watch1()
      const values2 = reg2("aadhaar") // Grab the inputs values
      const aadhaarVal = (document.getElementById("aadhaar") as HTMLInputElement)?.value || ""
      const gstinVal = (document.getElementById("gstin") as HTMLInputElement)?.value || ""

      // Construct payload mapping to API
      const payload = {
        businessName: values1.businessName,
        category: values1.category,
        experience: Number(values1.experience),
        serviceAreas: values1.serviceAreas,
        aadhaar: aadhaarVal,
        gstin: gstinVal || undefined,
        // In a real application, we would upload files to Cloudinary and send URLs.
        // We will send mock file naming references.
        documents: docFiles.map((f) => f.name),
        portfolio: portfolioFiles.map((f) => f.name),
      }

      // Execute onboarding API call
      const updatedUser = await authApi.vendorOnboarding(payload)
      
      // Update Zustand local memory
      setUser(updatedUser)
      toast.success("Onboarding completed! Welcome to your Vendor Dashboard.")
      
      router.push("/vendor/dashboard")
    } catch (err: any) {
      console.error(err)
      const msg = err.response?.data?.message || err.message || "Failed to complete onboarding. Please check your data."
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0C0D0F] text-white flex flex-col font-industrial">
      {/* Top Header branding */}
      <header className="border-b border-[#1E2226] bg-[#111315]/50 backdrop-blur-md sticky top-0 py-4 px-6 sm:px-12 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-orange flex items-center justify-center text-white shadow-md shadow-orange/20 animate-pulse">
            <Flame className="h-5 w-5 fill-current" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-white uppercase">HomeEvo Business</span>
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          Step {step} of 3
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
        <div className="w-full max-w-2xl bg-[#111315] border border-[#1E2226] p-8 rounded-2xl shadow-2xl space-y-8">
          
          {/* Progress Indicator */}
          <div className="space-y-3.5">
            <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              <span className={step >= 1 ? "text-orange" : ""}>1. Business Profile</span>
              <span className={step >= 2 ? "text-orange" : ""}>2. Verifications</span>
              <span className={step >= 3 ? "text-orange" : ""}>3. Portfolio Showcase</span>
            </div>
            <Progress value={step === 1 ? 33 : step === 2 ? 66 : 100} className="h-1.5 bg-[#181B1E] [&>div]:bg-orange" />
          </div>

          {/* STEP 1: BUSINESS DETAILS */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <h1 className="text-2xl font-display font-extrabold tracking-tight text-white uppercase">Business Profile</h1>
                <p className="text-sm text-muted-foreground font-sans">Provide details about your construction or renovation service.</p>
              </div>

              <form onSubmit={handleSub1(onNextStep1)} className="space-y-5">
                {/* Business Name */}
                <div className="space-y-1.5 font-sans">
                  <label htmlFor="businessName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Business / Company Name
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                    <Input
                      id="businessName"
                      type="text"
                      className="pl-10 h-11 border-[#1E2226] bg-[#181B1E] text-white focus:ring-orange focus:border-orange"
                      placeholder="e.g. Hyderabad Steel Structures"
                      {...reg1("businessName", { required: true })}
                    />
                  </div>
                  {err1.businessName && <p className="text-xs text-destructive">{err1.businessName.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                  {/* Primary Category */}
                  <div className="space-y-1.5">
                    <label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Primary Work Category
                    </label>
                    <select
                      id="category"
                      className="w-full px-4 h-11 border border-[#1E2226] bg-[#181B1E] text-white rounded-lg focus:ring-1 focus:ring-orange text-sm"
                      {...reg1("category", { required: true })}
                    >
                      <option value="">Select Category</option>
                      {VENDOR_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {err1.category && <p className="text-xs text-destructive">{err1.category.message}</p>}
                  </div>

                  {/* Years of Experience */}
                  <div className="space-y-1.5">
                    <label htmlFor="experience" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Years of Experience
                    </label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      className="h-11 border-[#1E2226] bg-[#181B1E] text-white focus:ring-orange"
                      {...reg1("experience", { required: true })}
                    />
                    {err1.experience && <p className="text-xs text-destructive">{err1.experience.message}</p>}
                  </div>
                </div>

                {/* Service Areas in AP */}
                <div className="space-y-2.5 font-sans">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Service Operating Areas (Andhra Pradesh)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 rounded-xl border border-[#1E2226] bg-[#181B1E] max-h-48 overflow-y-auto">
                    {AP_CITIES.map((city) => {
                      const isSelected = selectedAreas.includes(city)
                      return (
                        <button
                          key={city}
                          type="button"
                          onClick={() => toggleServiceArea(city)}
                          className={`p-2.5 text-left text-xs font-medium rounded-lg border transition-all duration-200 ${
                            isSelected
                              ? "border-orange bg-orange/10 text-orange"
                              : "border-[#1E2226] hover:border-muted text-muted-foreground"
                          }`}
                        >
                          {city}
                        </button>
                      )
                    })}
                  </div>
                  {err1.serviceAreas && <p className="text-xs text-destructive">{err1.serviceAreas.message}</p>}
                </div>

                <div className="flex justify-end pt-3">
                  <Button
                    type="submit"
                    className="h-11 bg-orange text-white hover:bg-orange/90 px-6 font-bold tracking-wide rounded-lg flex items-center gap-2"
                  >
                    Next Step
                    <ArrowRight className="h-4.5 w-4.5" />
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: VERIFICATION DOCUMENTS */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <h1 className="text-2xl font-display font-extrabold tracking-tight text-white uppercase">Verification Records</h1>
                <p className="text-sm text-muted-foreground font-sans">Verify your business details to build consumer trust on HomeEvo.</p>
              </div>

              <form onSubmit={handleSub2(onNextStep2)} className="space-y-5">
                {/* Aadhaar Number */}
                <div className="space-y-1.5 font-sans">
                  <label htmlFor="aadhaar" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Aadhaar ID Card Number (12 Digits)
                  </label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                    <Input
                      id="aadhaar"
                      type="text"
                      maxLength={12}
                      className="pl-10 h-11 border-[#1E2226] bg-[#181B1E] text-white focus:ring-orange"
                      placeholder="e.g. 123456789012"
                      {...reg2("aadhaar", { required: true })}
                    />
                  </div>
                  {err2.aadhaar && <p className="text-xs text-destructive">{err2.aadhaar.message}</p>}
                </div>

                {/* GSTIN (Optional) */}
                <div className="space-y-1.5 font-sans">
                  <label htmlFor="gstin" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    GSTIN Number (Optional - 15 Characters)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                    <Input
                      id="gstin"
                      type="text"
                      maxLength={15}
                      className="pl-10 h-11 border-[#1E2226] bg-[#181B1E] text-white focus:ring-orange uppercase"
                      placeholder="e.g. 37AAAAA0000A1Z5"
                      {...reg2("gstin")}
                    />
                  </div>
                  {err2.gstin && <p className="text-xs text-destructive">{err2.gstin.message}</p>}
                </div>

                {/* File Upload Zone for documents */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-sans">
                    Verification Documents (Upload Aadhaar / GST Certificate PDF or Image)
                  </label>
                  <FileUpload
                    accept="image/*,application/pdf"
                    multiple={true}
                    onUpload={setDocFiles}
                    label="Upload verification files"
                    description="Upload Aadhaar card front/back or corporate business registration papers (Max 5MB)"
                    className="border-[#1E2226]"
                  />
                </div>

                <div className="flex justify-between pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="h-11 border-[#1E2226] bg-[#111315] hover:bg-[#181B1E] text-white px-6 font-bold tracking-wide rounded-lg flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4.5 w-4.5" />
                    Back
                  </Button>

                  <Button
                    type="submit"
                    className="h-11 bg-orange text-white hover:bg-orange/90 px-6 font-bold tracking-wide rounded-lg flex items-center gap-2"
                  >
                    Next Step
                    <ArrowRight className="h-4.5 w-4.5" />
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: PORTFOLIO SHOWCASE */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <h1 className="text-2xl font-display font-extrabold tracking-tight text-white uppercase">Portfolio Showcase</h1>
                <p className="text-sm text-muted-foreground font-sans">Upload at least 3 photos demonstrating your past architectural or contracting work.</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-sans">
                    Project Work Portfolio Photos (Upload 3 to 10 photos)
                  </label>
                  <FileUpload
                    accept="image/*"
                    multiple={true}
                    onUpload={setPortfolioFiles}
                    label="Select portfolio photos"
                    description="Drag & drop project photos showcasing finished work sites (Min 3 files required)"
                  />
                </div>

                <div className="flex justify-between pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    disabled={isSubmitting}
                    className="h-11 border-[#1E2226] bg-[#111315] hover:bg-[#181B1E] text-white px-6 font-bold tracking-wide rounded-lg flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4.5 w-4.5" />
                    Back
                  </Button>

                  <Button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="h-11 bg-orange text-white hover:bg-orange/90 px-8 font-bold tracking-wide rounded-lg flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Finishing Setup...
                      </>
                    ) : (
                      <>
                        Complete Onboarding
                        <CheckCircle2 className="h-4.5 w-4.5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
