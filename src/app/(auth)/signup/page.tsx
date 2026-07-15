"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Eye, EyeOff, Mail, Lock, User, Phone, Briefcase, Tag, Loader2, Sparkles, Construction, Flame } from "lucide-react"
import { useAuthStore } from "@/stores/authStore"
import { authApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

// Validation Schema
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number (10 digits starting with 6-9)"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["client", "vendor"]),
  businessName: z.string().optional(),
  category: z.string().optional(),
  agree: z.literal(true, {
    message: "You must agree to the Terms & Privacy Policy",
  }),
}).superRefine((data, ctx) => {
  if (data.role === "vendor") {
    if (!data.businessName || data.businessName.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["businessName"],
        message: "Business / Company Name is required for vendors",
      })
    }
    if (!data.category || data.category === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["category"],
        message: "Work Category is required for vendors",
      })
    }
  }
})

type SignupFormData = z.infer<typeof signupSchema>

// Custom lightweight Zod resolver for React Hook Form
function zodResolver<T extends z.ZodType<any, any>>(schema: T) {
  return async (values: any) => {
    try {
      const data = schema.parse(values)
      return { values: data, errors: {} }
    } catch (err: any) {
      const errors: Record<string, any> = {}
      if (err instanceof z.ZodError) {
        err.issues.forEach((error) => {
          const path = error.path.join(".")
          errors[path] = {
            type: error.code,
            message: error.message,
          }
        })
      }
      return { values: {}, errors }
    }
  }
}

export default function SignUpPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [showPassword, setShowPassword] = React.useState(false)
  const [apiError, setApiError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "client",
      businessName: "",
      category: "",
      agree: undefined,
    },
    resolver: zodResolver(signupSchema),
  })

  const currentRole = watch("role")

  const onSubmit = async (data: SignupFormData) => {
    setApiError(null)
    try {
      const res = await authApi.signup({
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
        role: data.role,
        businessName: data.role === "vendor" ? data.businessName : undefined,
        category: data.role === "vendor" ? data.category : undefined,
      })

      // Set cookie for Next.js Middleware route guard
      document.cookie = `homeevo-token=${res.accessToken}; path=/; max-age=86400; SameSite=Lax`

      // Set Zustand store state
      setAuth(res, res.user)
      toast.success("Account created successfully!")

      // Redirect depending on user role
      if (data.role === "client") {
        router.push("/dashboard")
      } else {
        router.push("/vendor/onboarding")
      }
    } catch (err: any) {
      console.error(err)
      const msg = err.response?.data?.message || err.message || "Failed to create account. Please try again."
      setApiError(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* LEFT PANEL - Adapts per role */}
      <div
        className={`w-full md:w-1/2 flex flex-col justify-between p-8 lg:p-12 transition-all duration-700 ease-in-out relative overflow-hidden ${
          currentRole === "client"
            ? "bg-gradient-to-br from-cream-warm to-orange-light text-brown"
            : "bg-gradient-to-br from-dark-2 to-dark-3 text-white border-r border-dark-4"
        }`}
      >
        {/* Glow Effects */}
        <div
          className={`absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full filter blur-3xl opacity-20 transition-all duration-700 ${
            currentRole === "client" ? "bg-orange" : "bg-orange"
          }`}
        />

        {/* Branding header */}
        <div className="flex items-center gap-2.5 z-10">
          <div className="h-9 w-9 rounded-xl bg-orange flex items-center justify-center text-white shadow-md shadow-orange/20 animate-pulse">
            <Flame className="h-5 w-5 fill-current" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">HomeEvo</span>
        </div>

        {/* Role adaptation illustration */}
        <div className="my-auto py-12 flex flex-col justify-center items-start space-y-6 max-w-md z-10">
          {currentRole === "client" ? (
            <div className="space-y-6 animate-fade-in">
              <div className="h-14 w-14 rounded-2xl bg-orange/10 border border-orange/20 flex items-center justify-center text-orange shadow-inner">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-display font-extrabold tracking-tight leading-tight">
                Create a Homeowner account. Connect with verified builders.
              </h2>
              <p className="text-sm font-normal leading-relaxed opacity-85 font-body">
                Verify local construction bids, hire professionals using secure milestones, and keep your project secure with Escrow.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="h-14 w-14 rounded-2xl bg-orange/10 border border-orange/20 flex items-center justify-center text-orange shadow-inner">
                <Construction className="h-7 w-7" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-display font-extrabold tracking-tight leading-tight">
                Register as a Vendor. Join the HomeEvo construction network.
              </h2>
              <p className="text-sm font-normal leading-relaxed opacity-80 font-body">
                Showcase your business portfolio, win local construction deals in Andhra Pradesh, and safeguard your contract payments.
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-xs font-normal opacity-60 z-10">
          &copy; {new Date().getFullYear()} HomeEvo. All rights reserved. Andhra Pradesh, India.
        </div>
      </div>

      {/* RIGHT PANEL - Forms */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-card text-card-foreground">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-extrabold tracking-tight">Create Account</h1>
            <p className="text-sm text-muted-foreground">Register your account with HomeEvo</p>
          </div>

          {/* Role Pill Switcher */}
          <div className="p-1.5 bg-muted/50 border border-border rounded-xl flex gap-1 w-full">
            <button
              type="button"
              onClick={() => setValue("role", "client")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 ${
                currentRole === "client"
                  ? "bg-orange text-white shadow-md shadow-orange/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Homeowner
            </button>
            <button
              type="button"
              onClick={() => setValue("role", "vendor")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 ${
                currentRole === "vendor"
                  ? "bg-orange text-white shadow-md shadow-orange/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Vendor / Contractor
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Inline API Error Alert */}
            {apiError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium rounded-lg">
                {apiError}
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className={`pl-10 h-10 border border-border bg-card rounded-lg focus:ring-1 focus:ring-orange ${
                    errors.name ? "border-destructive focus:ring-destructive" : ""
                  }`}
                  {...register("name")}
                />
              </div>
              {errors.name && <p className="text-xs text-destructive font-medium">{errors.name.message}</p>}
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={`pl-10 h-10 border border-border bg-card rounded-lg focus:ring-1 focus:ring-orange ${
                    errors.email ? "border-destructive focus:ring-destructive" : ""
                  }`}
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive font-medium">{errors.email.message}</p>}
            </div>

            {/* Mobile Number */}
            <div className="space-y-1">
              <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  className={`pl-10 h-10 border border-border bg-card rounded-lg focus:ring-1 focus:ring-orange ${
                    errors.phone ? "border-destructive focus:ring-destructive" : ""
                  }`}
                  {...register("phone")}
                />
              </div>
              {errors.phone && <p className="text-xs text-destructive font-medium">{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`pl-10 pr-10 h-10 border border-border bg-card rounded-lg focus:ring-1 focus:ring-orange ${
                    errors.password ? "border-destructive focus:ring-destructive" : ""
                  }`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive font-medium">{errors.password.message}</p>}
            </div>

            {/* VENDOR ONLY FIELDS */}
            {currentRole === "vendor" && (
              <div className="space-y-4 p-4 rounded-xl bg-muted/20 border border-border shadow-inner animate-slide-down">
                {/* Business Name */}
                <div className="space-y-1">
                  <label htmlFor="businessName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Business / Company Name
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="businessName"
                      type="text"
                      placeholder="e.g. Apex Builders Ltd"
                      className={`pl-10 h-10 border border-border bg-card rounded-lg focus:ring-1 focus:ring-orange ${
                        errors.businessName ? "border-destructive focus:ring-destructive" : ""
                      }`}
                      {...register("businessName")}
                    />
                  </div>
                  {errors.businessName && <p className="text-xs text-destructive font-medium">{errors.businessName.message}</p>}
                </div>

                {/* Primary Category */}
                <div className="space-y-1">
                  <label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Primary Work Category
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <select
                      id="category"
                      className={`w-full pl-10 pr-4 h-10 border border-border bg-card rounded-lg focus:ring-1 focus:ring-orange text-sm ${
                        errors.category ? "border-destructive focus:ring-destructive" : ""
                      }`}
                      {...register("category")}
                    >
                      <option value="">Select a category</option>
                      {VENDOR_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.category && <p className="text-xs text-destructive font-medium">{errors.category.message}</p>}
                </div>
              </div>
            )}

            {/* Terms and Privacy Checkbox */}
            <div className="space-y-1">
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  id="agree"
                  type="checkbox"
                  className={`mt-1 h-4 w-4 border-border text-orange rounded focus:ring-orange ${
                    errors.agree ? "border-destructive" : ""
                  }`}
                  {...register("agree")}
                />
                <label htmlFor="agree" className="text-xs font-medium leading-relaxed text-muted-foreground">
                  I agree to the HomeEvo{" "}
                  <Link href="/terms" className="text-orange hover:underline">
                    Terms of Service
                  </Link>{" "}
                  &{" "}
                  <Link href="/privacy" className="text-orange hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.agree && <p className="text-xs text-destructive font-medium">{errors.agree.message}</p>}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-orange text-white hover:bg-orange/95 flex items-center justify-center font-bold tracking-wide rounded-lg shadow-md shadow-orange/10 hover:shadow-lg transition-all duration-300 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* SignIn Redirection Footer */}
          <p className="text-center text-sm font-medium text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/signin" className="text-orange font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
