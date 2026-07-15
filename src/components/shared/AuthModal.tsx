"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Eye, EyeOff, Mail, Lock, User, Phone, Briefcase, Tag, Loader2, Sparkles, Construction, Flame } from "lucide-react"

import { useAuthStore } from "@/stores/authStore"
import { authApi } from "@/lib/api"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

// Validation Schemas
const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["client", "vendor"]),
})

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

type SigninFormData = z.infer<typeof signinSchema>
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

const ROLE_HOME = {
  client: "/dashboard",
  vendor: "/vendor/dashboard",
  admin: "/admin/dashboard",
}

interface AuthModalProps {
  defaultRole?: "client" | "vendor"
  defaultMode?: "signin" | "signup"
  open: boolean
  onClose: () => void
}

export function AuthModal({
  defaultRole = "client",
  defaultMode = "signin",
  open,
  onClose,
}: AuthModalProps) {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [role, setRole] = React.useState<"client" | "vendor">(defaultRole)
  const [mode, setMode] = React.useState<"signin" | "signup">(defaultMode)

  // Sync role and mode if props change
  React.useEffect(() => {
    setRole(defaultRole)
  }, [defaultRole, open])

  React.useEffect(() => {
    setMode(defaultMode)
  }, [defaultMode, open])

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-[90%] md:max-w-4xl p-0 gap-0 overflow-hidden rounded-2xl bg-card border-none ring-1 ring-black/10">
        <div className="flex flex-col md:flex-row h-full min-h-[580px]">
          
          {/* LEFT PANEL - Adapts per role */}
          <div
            className={`w-full md:w-5/12 flex flex-col justify-between p-6 sm:p-8 md:p-10 transition-all duration-700 ease-in-out relative overflow-hidden ${
              role === "client"
                ? "bg-gradient-to-br from-cream-warm to-orange-light text-brown"
                : "bg-gradient-to-br from-dark-2 to-dark-3 text-white border-r border-dark-4"
            }`}
          >
            {/* Glow effect */}
            <div
              className={`absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full filter blur-3xl opacity-20 transition-all duration-700 ${
                role === "client" ? "bg-orange" : "bg-orange"
              }`}
            />

            {/* Branding header */}
            <div className="flex items-center gap-2.5 z-10">
              <div className="h-9 w-9 rounded-xl bg-orange flex items-center justify-center text-white shadow-md shadow-orange/20 animate-pulse">
                <Flame className="h-5 w-5 fill-current" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight">HomeEvo</span>
            </div>

            {/* Content adapts based on role */}
            <div className="my-auto py-8 md:py-12 flex flex-col justify-center items-start space-y-5 max-w-sm z-10">
              {role === "client" ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="h-12 w-12 rounded-2xl bg-orange/10 border border-orange/20 flex items-center justify-center text-orange shadow-inner">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight leading-tight">
                    Build your dream home with <span className="text-orange">verified</span> experts.
                  </h2>
                  <p className="text-xs md:text-sm font-normal leading-relaxed opacity-85 font-body">
                    Access top-rated contractors and architects in Andhra Pradesh. Manage milestones and complete secure payments via escrow.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="h-12 w-12 rounded-2xl bg-orange/10 border border-orange/20 flex items-center justify-center text-orange shadow-inner">
                    <Construction className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight leading-tight">
                    Expand your contracting business. Get <span className="text-orange">guaranteed</span> payouts.
                  </h2>
                  <p className="text-xs md:text-sm font-normal leading-relaxed opacity-80 font-body">
                    Access thousands of premium construction projects in AP. Bid with confidence, complete milestones, and get paid instantly.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-[10px] font-normal opacity-50 z-10 font-mono">
              &copy; {new Date().getFullYear()} HomeEvo. AP, India.
            </div>
          </div>

          {/* RIGHT PANEL - Forms & Toggles */}
          <div className="w-full md:w-7/12 p-6 sm:p-8 md:p-10 flex flex-col bg-card justify-center">
            <div className="w-full max-w-md mx-auto space-y-6">
              
              {/* Role Toggle Pill Switcher */}
              <div className="p-1 bg-muted/30 border border-border/80 rounded-xl flex gap-1 w-full">
                <button
                  type="button"
                  onClick={() => setRole("client")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 ${
                    role === "client"
                      ? "bg-orange text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Homeowner
                </button>
                <button
                  type="button"
                  onClick={() => setRole("vendor")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 ${
                    role === "vendor"
                      ? "bg-orange text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Vendor / Contractor
                </button>
              </div>

              {/* Tabs for Sign In vs Sign Up */}
              <Tabs value={mode} onValueChange={(val) => setMode(val as "signin" | "signup")} className="w-full">
                <TabsList className="w-full grid grid-cols-2 p-[2px] bg-muted/20 border border-border/50 rounded-lg mb-6">
                  <TabsTrigger value="signin" className="py-1.5 text-xs">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" className="py-1.5 text-xs">Create Account</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="mt-0 outline-none">
                  <SignInForm role={role} onSuccess={onClose} />
                </TabsContent>

                <TabsContent value="signup" className="mt-0 outline-none">
                  <SignUpForm role={role} onSuccess={onClose} />
                </TabsContent>
              </Tabs>

            </div>
          </div>
          
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ==========================================================================
   SIGN IN FORM COMPONENT
   ========================================================================== */
function SignInForm({ role, onSuccess }: { role: "client" | "vendor"; onSuccess: () => void }) {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [showPassword, setShowPassword] = React.useState(false)
  const [apiError, setApiError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormData>({
    defaultValues: {
      email: "",
      password: "",
      role: role,
    },
    resolver: zodResolver(signinSchema),
  })

  const onSubmit = async (data: SigninFormData) => {
    setApiError(null)
    try {
      const res = await authApi.signin({
        email: data.email,
        password: data.password,
        role: role, // use current role
      })

      // Set cookie for Next.js Middleware route guard
      document.cookie = `homeevo-token=${res.accessToken}; path=/; max-age=86400; SameSite=Lax`

      // Set Zustand store state
      setAuth(res, res.user)
      toast.success(`Welcome back, ${res.user.name}!`)

      onSuccess()
      
      // Redirect based on user role
      const targetPath = res.user.role === "admin" ? ROLE_HOME.admin : ROLE_HOME[role]
      router.push(targetPath)
    } catch (err: any) {
      console.error(err)
      const msg = err.response?.data?.message || err.message || "Failed to sign in. Please try again."
      setApiError(msg)
      toast.error(msg)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {apiError && (
        <div className="p-2.5 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium rounded-lg">
          {apiError}
        </div>
      )}

      {/* Email Address */}
      <div className="space-y-1">
        <label htmlFor="signin-email" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="signin-email"
            type="email"
            placeholder="name@example.com"
            className={`pl-9 h-9 border border-border bg-card rounded-lg focus:ring-1 focus:ring-orange ${
              errors.email ? "border-destructive focus:ring-destructive" : ""
            }`}
            {...register("email")}
          />
        </div>
        {errors.email && <p className="text-[11px] text-destructive font-medium">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="signin-password" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Password
          </label>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="signin-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className={`pl-9 pr-9 h-9 border border-border bg-card rounded-lg focus:ring-1 focus:ring-orange ${
              errors.password ? "border-destructive focus:ring-destructive" : ""
            }`}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-[11px] text-destructive font-medium">{errors.password.message}</p>}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-9 mt-2 bg-orange text-white hover:bg-orange/95 flex items-center justify-center font-bold tracking-wide rounded-lg shadow-md shadow-orange/10 transition-all duration-300"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  )
}

/* ==========================================================================
   SIGN UP FORM COMPONENT
   ========================================================================== */
function SignUpForm({ role, onSuccess }: { role: "client" | "vendor"; onSuccess: () => void }) {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [showPassword, setShowPassword] = React.useState(false)
  const [apiError, setApiError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: role,
      businessName: "",
      category: "",
      agree: undefined,
    },
    resolver: zodResolver(signupSchema),
  })

  // Sync role value in hook form when prop updates
  React.useEffect(() => {
    setValue("role", role)
  }, [role, setValue])

  const onSubmit = async (data: SignupFormData) => {
    setApiError(null)
    try {
      const res = await authApi.signup({
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
        role: role,
        businessName: role === "vendor" ? data.businessName : undefined,
        category: role === "vendor" ? data.category : undefined,
      })

      // Set cookie for Next.js Middleware route guard
      document.cookie = `homeevo-token=${res.accessToken}; path=/; max-age=86400; SameSite=Lax`

      // Set Zustand store state
      setAuth(res, res.user)
      toast.success("Account created successfully!")

      onSuccess()

      // Redirect depending on user role
      if (role === "client") {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
      {apiError && (
        <div className="p-2.5 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium rounded-lg">
          {apiError}
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-0.5">
        <label htmlFor="signup-name" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="signup-name"
            type="text"
            placeholder="John Doe"
            className={`pl-9 h-9 border border-border bg-card rounded-lg focus:ring-1 focus:ring-orange ${
              errors.name ? "border-destructive focus:ring-destructive" : ""
            }`}
            {...register("name")}
          />
        </div>
        {errors.name && <p className="text-[11px] text-destructive font-medium">{errors.name.message}</p>}
      </div>

      {/* Email Address */}
      <div className="space-y-0.5">
        <label htmlFor="signup-email" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="signup-email"
            type="email"
            placeholder="name@example.com"
            className={`pl-9 h-9 border border-border bg-card rounded-lg focus:ring-1 focus:ring-orange ${
              errors.email ? "border-destructive focus:ring-destructive" : ""
            }`}
            {...register("email")}
          />
        </div>
        {errors.email && <p className="text-[11px] text-destructive font-medium">{errors.email.message}</p>}
      </div>

      {/* Mobile Number */}
      <div className="space-y-0.5">
        <label htmlFor="signup-phone" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Mobile Number
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="signup-phone"
            type="tel"
            placeholder="9876543210"
            className={`pl-9 h-9 border border-border bg-card rounded-lg focus:ring-1 focus:ring-orange ${
              errors.phone ? "border-destructive focus:ring-destructive" : ""
            }`}
            {...register("phone")}
          />
        </div>
        {errors.phone && <p className="text-[11px] text-destructive font-medium">{errors.phone.message}</p>}
      </div>

      {/* Password */}
      <div className="space-y-0.5">
        <label htmlFor="signup-password" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className={`pl-9 pr-9 h-9 border border-border bg-card rounded-lg focus:ring-1 focus:ring-orange ${
              errors.password ? "border-destructive focus:ring-destructive" : ""
            }`}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-[11px] text-destructive font-medium">{errors.password.message}</p>}
      </div>

      {/* VENDOR ONLY FIELDS */}
      {role === "vendor" && (
        <div className="space-y-3 p-3 rounded-xl bg-muted/20 border border-border shadow-inner animate-slide-down">
          {/* Business Name */}
          <div className="space-y-0.5">
            <label htmlFor="signup-bizname" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Business Name
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="signup-bizname"
                type="text"
                placeholder="e.g. Apex Builders Ltd"
                className={`pl-9 h-9 border border-border bg-card rounded-lg focus:ring-1 focus:ring-orange ${
                  errors.businessName ? "border-destructive focus:ring-destructive" : ""
                }`}
                {...register("businessName")}
              />
            </div>
            {errors.businessName && <p className="text-[11px] text-destructive font-medium">{errors.businessName.message}</p>}
          </div>

          {/* Primary Category */}
          <div className="space-y-0.5">
            <label htmlFor="signup-category" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Primary Work Category
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground z-10" />
              <select
                id="signup-category"
                className={`w-full pl-9 pr-4 h-9 border border-border bg-card rounded-lg focus:ring-1 focus:ring-orange text-xs ${
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
            {errors.category && <p className="text-[11px] text-destructive font-medium">{errors.category.message}</p>}
          </div>
        </div>
      )}

      {/* Agree to terms */}
      <div className="space-y-1">
        <div className="flex items-start gap-2 pt-1">
          <input
            id="signup-agree"
            type="checkbox"
            className="mt-0.5 h-3.5 w-3.5 border-border text-orange rounded focus:ring-orange"
            {...register("agree")}
          />
          <label htmlFor="signup-agree" className="text-[11px] font-medium leading-relaxed text-muted-foreground">
            I agree to the HomeEvo Terms & Privacy Policy
          </label>
        </div>
        {errors.agree && <p className="text-[11px] text-destructive font-medium">{errors.agree.message}</p>}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-9 bg-orange text-white hover:bg-orange/95 flex items-center justify-center font-bold tracking-wide rounded-lg shadow-md shadow-orange/10 transition-all duration-300 mt-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  )
}
