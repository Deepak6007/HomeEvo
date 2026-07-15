"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Eye, EyeOff, Mail, Lock, Loader2, Sparkles, Construction, Flame } from "lucide-react"
import { useAuthStore } from "@/stores/authStore"
import { authApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Validation Schema
const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["client", "vendor"]),
})

type SigninFormData = z.infer<typeof signinSchema>

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

const ROLE_HOME = {
  client: "/dashboard",
  vendor: "/vendor/dashboard",
  admin: "/admin/dashboard",
}

export default function SignInPage() {
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
  } = useForm<SigninFormData>({
    defaultValues: {
      email: "",
      password: "",
      role: "client",
    },
    resolver: zodResolver(signinSchema),
  })

  const currentRole = watch("role")

  const onSubmit = async (data: SigninFormData) => {
    setApiError(null)
    try {
      const res = await authApi.signin({
        email: data.email,
        password: data.password,
        role: data.role,
      })

      // Set cookie for Next.js Middleware route guard
      document.cookie = `homeevo-token=${res.accessToken}; path=/; max-age=86400; SameSite=Lax`

      // Set Zustand store state
      setAuth(res, res.user)
      toast.success(`Welcome back, ${res.user.name}!`)

      // Redirect based on user role (Admin user could log in through signin page too)
      const targetPath = res.user.role === "admin" ? ROLE_HOME.admin : ROLE_HOME[data.role]
      router.push(targetPath)
    } catch (err: any) {
      console.error(err)
      const msg = err.response?.data?.message || err.message || "Failed to sign in. Please try again."
      setApiError(msg)
      toast.error(msg)
    }
  }

  const handleGoogleSignIn = () => {
    toast.info("Google OAuth is coming soon!")
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
                Build your dream home with <span className="text-orange">verified</span> local experts.
              </h2>
              <p className="text-sm font-normal leading-relaxed opacity-85 font-body">
                Access top-rated contractors and architects in Andhra Pradesh. Manage milestones and complete secure payments via escrow.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="h-14 w-14 rounded-2xl bg-orange/10 border border-orange/20 flex items-center justify-center text-orange shadow-inner">
                <Construction className="h-7 w-7" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-display font-extrabold tracking-tight leading-tight">
                Expand your contracting business. Get <span className="text-orange">guaranteed</span> escrow payouts.
              </h2>
              <p className="text-sm font-normal leading-relaxed opacity-80 font-body">
                Access thousands of premium construction projects in AP. Bid with confidence, complete milestones, and get paid instantly.
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
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-extrabold tracking-tight">Sign In</h1>
            <p className="text-sm text-muted-foreground">Select your workspace to get started</p>
          </div>

          {/* Role Pill Switcher */}
          <div className="p-1.5 bg-muted/50 border border-border rounded-xl flex gap-1 w-full">
            <button
              type="button"
              onClick={() => setValue("role", "client")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 ${
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
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 ${
                currentRole === "vendor"
                  ? "bg-orange text-white shadow-md shadow-orange/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Vendor / Contractor
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Inline API Error Alert */}
            {apiError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium rounded-lg">
                {apiError}
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={`pl-10 h-11 border border-border bg-card rounded-lg focus:ring-1 focus:ring-orange ${
                    errors.email ? "border-destructive focus:ring-destructive" : ""
                  }`}
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive font-medium">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-orange hover:underline focus:outline-none"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`pl-10 pr-10 h-11 border border-border bg-card rounded-lg focus:ring-1 focus:ring-orange ${
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

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-orange text-white hover:bg-orange/95 flex items-center justify-center font-bold tracking-wide rounded-lg shadow-md shadow-orange/10 hover:shadow-lg transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Social Sign In Divider */}
          <div className="relative flex items-center justify-center my-6">
            <span className="absolute w-full border-t border-border" />
            <span className="relative px-3 bg-card text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Or continue with
            </span>
          </div>

          {/* Google SSO Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full h-11 border border-border bg-card hover:bg-muted/10 font-bold tracking-wide text-foreground rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
          >
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google
          </Button>

          {/* Signup redirection footer */}
          <p className="text-center text-sm font-medium text-muted-foreground mt-4">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-orange font-bold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
