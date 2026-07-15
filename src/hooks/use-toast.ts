"use client"

import { toast as sonnerToast } from "sonner"
import * as React from "react"

export interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success" | "info"
  action?: React.ReactNode
  duration?: number
}

export function toast({ title, description, variant, action, duration, ...props }: ToastProps) {
  const options = {
    description,
    action,
    duration,
    ...props,
  }

  if (variant === "destructive") {
    return sonnerToast.error(title || "Error", options)
  }

  if (variant === "success") {
    return sonnerToast.success(title || "Success", options)
  }

  if (variant === "info") {
    return sonnerToast.info(title || "Info", options)
  }

  return sonnerToast(title || "", options)
}

export function useToast() {
  return {
    toast,
    dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  }
}
