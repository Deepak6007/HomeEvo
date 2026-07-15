"use client"

import * as React from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Mail, ArrowLeft, Loader2, CheckCircle2, Flame } from "lucide-react"
import { authApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

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

export default function ForgotPasswordPage() {
  const [success, setSuccess] = React.useState(false)
  const [apiError, setApiError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    defaultValues: { email: "" },
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setApiError(null)
    try {
      await authApi.forgotPassword(data.email)
      setSuccess(true)
      toast.success("Recovery instructions sent to your email.")
    } catch (err: any) {
      console.error(err)
      const msg = err.response?.data?.message || err.message || "Failed to initiate password reset. Please try again."
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

        {success ? (
          <div className="text-center space-y-4 py-4 animate-scale-up">
            <div className="flex justify-center text-green-500">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h1 className="text-2xl font-display font-extrabold tracking-tight">Check your inbox</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We have sent password recovery instructions. Please follow the instructions in the email to configure your new credentials.
            </p>
            <div className="pt-2">
              <Link href="/signin">
                <Button className="w-full h-11 bg-orange text-white hover:bg-orange/95 font-bold tracking-wide rounded-lg flex items-center justify-center">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-display font-extrabold tracking-tight">Reset Password</h1>
              <p className="text-sm text-muted-foreground">
                Enter your email address to receive password recovery details.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {apiError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium rounded-lg">
                  {apiError}
                </div>
              )}

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

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-orange text-white hover:bg-orange/95 flex items-center justify-center font-bold tracking-wide rounded-lg shadow-md transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Recovery Link...
                  </>
                ) : (
                  "Send Reset Instructions"
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
