"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/shared/FileUpload"
import { useCreateProject } from "@/hooks/useProjects"
import { projectsApi } from "@/lib/api/projects"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react"

// Step 1: Basics Schema
const step1Schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000),
  location: z.string().min(1, "Please enter a location"),
})

// Step 2: Budget & Timeline Schema
const step2Schema = z.object({
  budget: z.coerce.number().min(50000, "Estimated budget must be at least ₹50,000"),
  startDate: z.string().refine((date) => new Date(date).getTime() >= new Date().setHours(0, 0, 0, 0), {
    message: "Start date must be today or in the future",
  }),
  timeline: z.string().min(1, "Please enter a duration (e.g., '6 months')"),
})

const createProjectSchema = step1Schema.merge(step2Schema)

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  open,
  onOpenChange,
}) => {
  const router = useRouter()
  const [step, setStep] = React.useState(1)
  const [files, setFiles] = React.useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const createMutation = useCreateProject()

  interface FormInputs {
    title: string
    category: string
    description: string
    location: string
    budget: number
    startDate: string
    timeline: string
  }

  // Form setup using React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(createProjectSchema) as any,
    mode: "onBlur",
    defaultValues: {
      title: "",
      category: "",
      description: "",
      location: "",
      budget: 0,
      startDate: new Date().toISOString().split("T")[0],
      timeline: "",
    },
  })

  // Synchronize category select value
  const categoryValue = watch("category")

  React.useEffect(() => {
    if (!open) {
      setStep(1)
      setFiles([])
      reset()
    }
  }, [open, reset])

  const handleNext = async () => {
    // Validate current step before advancing
    const fieldsToValidate =
      step === 1
        ? ["title", "category", "description", "location"]
        : ["budget", "startDate", "timeline"]

    const isValid = await trigger(fieldsToValidate as any)
    if (isValid) {
      setStep((s) => s + 1)
    }
  }

  const handlePrev = () => {
    setStep((s) => Math.max(1, s - 1))
  }

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true)

      // 1. Mutate DTO to create project
      const createdProject = await createMutation.mutateAsync({
        title: data.title,
        description: data.description,
        category: data.category,
        budget: Number(data.budget),
        location: data.location,
        timeline: data.timeline,
      })

      // 2. In parallel/sequence upload images if any reference files are attached
      if (files.length > 0) {
        toast.info(`Uploading reference images...`)
        for (const file of files) {
          try {
            await projectsApi.uploadSitePhoto(createdProject.id, file)
          } catch (uploadError) {
            console.error(`Failed to upload ${file.name}:`, uploadError)
          }
        }
      }

      toast.success("Project created successfully! 🎉")
      onOpenChange(false)
      // Redirect to newly created project details
      router.push(`/client/projects/${createdProject.id}`)
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || "Failed to create project. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full bg-white text-[#3D2B1F] p-6 rounded-xl border border-[#E85D04]/10 shadow-lg">
        <DialogHeader className="space-y-1">
          <DialogTitle className="font-serif text-xl font-bold text-[#3D2B1F] flex items-center gap-1.5">
            <Sparkles className="h-5 w-5 text-[#E85D04]" />
            Construct Your Idea
          </DialogTitle>
          <DialogDescription className="text-2xs text-[#6F5B4B] font-medium tracking-wide">
            Step {step} of 3: {step === 1 ? "Details" : step === 2 ? "Budget & Timeline" : "Uploader"}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicators */}
        <div className="flex gap-1.5 h-1 w-full bg-border/40 rounded-full overflow-hidden my-2">
          <div className={`h-full transition-all duration-300 ${step >= 1 ? "bg-[#E85D04] w-1/3" : "w-0"}`} />
          <div className={`h-full transition-all duration-300 ${step >= 2 ? "bg-[#E85D04] w-1/3" : "w-0"}`} />
          <div className={`h-full transition-all duration-300 ${step >= 3 ? "bg-[#E85D04] w-1/3" : "w-0"}`} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3D2B1F]">Project Title</label>
                <Input
                  {...register("title")}
                  placeholder="e.g. 3BHK Duplex in Vizag"
                  className="bg-card/50 border-border/80 focus:border-[#E85D04]/40"
                />
                {errors.title && (
                  <span className="text-3xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.title.message}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3D2B1F]">Category</label>
                <Select
                  value={categoryValue}
                  onValueChange={(val) => setValue("category", val || "")}
                >
                  <SelectTrigger className="bg-card/50 border-border/80 text-xs text-[#3D2B1F]">
                    <SelectValue placeholder="Select service category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-border text-[#3D2B1F]">
                    <SelectItem value="Villa Construction">Villa Construction</SelectItem>
                    <SelectItem value="House Renovation">House Renovation</SelectItem>
                    <SelectItem value="Interior Design">Interior Design</SelectItem>
                    <SelectItem value="Masons & Plastering">Masons & Plastering</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <span className="text-3xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.category.message}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3D2B1F]">Description</label>
                <textarea
                  {...register("description")}
                  placeholder="Provide comprehensive details about the renovation requirements..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-lg border border-border/80 bg-card/50 outline-none focus:border-[#E85D04]/40 transition-colors"
                />
                {errors.description && (
                  <span className="text-3xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.description.message}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3D2B1F]">Location in AP</label>
                <Input
                  {...register("location")}
                  placeholder="e.g. Madhurawada, Visakhapatnam"
                  className="bg-card/50 border-border/80"
                />
                {errors.location && (
                  <span className="text-3xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.location.message}
                  </span>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3D2B1F]">Estimated Budget (₹)</label>
                <Input
                  type="number"
                  {...register("budget")}
                  placeholder="e.g. 1500000"
                  className="bg-card/50 border-border/80"
                />
                {errors.budget && (
                  <span className="text-3xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.budget.message}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3D2B1F]">Desired Start Date</label>
                <Input
                  type="date"
                  {...register("startDate")}
                  className="bg-card/50 border-border/80"
                />
                {errors.startDate && (
                  <span className="text-3xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.startDate.message}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3D2B1F]">Duration / Timeline</label>
                <Input
                  {...register("timeline")}
                  placeholder="e.g. 6 months"
                  className="bg-card/50 border-border/80"
                />
                {errors.timeline && (
                  <span className="text-3xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.timeline.message}
                  </span>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3D2B1F]">Reference Photos / Blueprints (Optional)</label>
                <FileUpload
                  accept="image/*"
                  multiple={true}
                  onUpload={(filesList) => setFiles(filesList)}
                  label="Attach site photos or blueprints"
                  description="Upload visual design sheets up to 5MB each."
                  maxSize={5 * 1024 * 1024}
                />
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            {step > 1 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={handlePrev}
                disabled={isSubmitting}
                className="text-[#6F5B4B] hover:bg-[#FDF8F2] flex items-center gap-1 text-xs"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-[#3D2B1F] text-white hover:bg-[#2C1F16] flex items-center gap-1 text-xs"
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#E85D04] text-white hover:bg-[#D45203] flex items-center gap-1 text-xs shadow-sm font-semibold active:scale-95 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateProjectModal
