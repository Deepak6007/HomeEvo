"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Lock, Eye, EyeOff, Loader2, ArrowLeft, AlertTriangle, Flame } from "lucide-react"
import { authApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

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

function ResetPasswordPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [apiError, setApiError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    defaultValues: { password: "", confirmPassword: "" },
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setApiError("Authentication token is missing. Please check your reset link.")
      toast.error("Missing reset token")
      return
    }

    setApiError(null)
    try {
      await authApi.resetPassword(token, data.password)
      toast.success("Password has been successfully updated.")
      router.push("/signin")
    } catch (err: any) {
      console.error(err)
      const msg = err.response?.data?.message || err.message || "Failed to reset password. The link may have expired."
      setApiError(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-cream dark:bg-dark">
      <div className="w-full max-w-md bg-card text-card-foreground border border-border p-8 rounded-2xl shadow-xl space-y-6">
        {/* Branding header */}
        <div className="flex flex-col items-center space-y-3">
          <div className="h-10 w-10 rounded-xl bg-orange flex items-center justify-center text-white shadow-md shadow-orange/20">
            <Flame className="h-5.5 w-5.5 fill-current" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">HomeEvo</span>
        </div>

        {!token ? (
          <div className="text-center space-y-4 py-4 animate-scale-up">
            <div className="flex justify-center text-orange">
              <AlertTriangle className="h-12 w-12" />
            </div>
            <h1 className="text-2xl font-display font-extrabold tracking-tight">Invalid Link</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The password reset token is missing from the web address. Please verify the URL in your email or request a new reset link.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/forgot-password">
                <Button className="w-full h-11 bg-orange text-white hover:bg-orange/95 font-bold tracking-wide rounded-lg flex items-center justify-center">
                  Request New Link
                </Button>
              </Link>
              <Link href="/signin" className="text-xs text-muted-foreground hover:text-foreground font-bold underline">
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-display font-extrabold tracking-tight">New Credentials</h1>
              <p className="text-sm text-muted-foreground">Configure your new secure account password below.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {apiError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium rounded-lg">
                  {apiError}
                </div>
              )}

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  New Password
                </label>
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

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 h-11 border border-border bg-card rounded-lg focus:ring-1 focus:ring-orange ${
                      errors.confirmPassword ? "border-destructive focus:ring-destructive" : ""
                    }`}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-orange text-white hover:bg-orange/95 flex items-center justify-center font-bold tracking-wide rounded-lg shadow-md transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>

            <div className="text-center">
              <Link
                href="/signin"
                className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-6 bg-cream dark:bg-dark">
        <div className="text-center font-mono text-xs text-muted-foreground animate-pulse">
          Loading credentials...
        </div>
      </div>
    }>
      <ResetPasswordPageContent />
    </React.Suspense>
  )
}
