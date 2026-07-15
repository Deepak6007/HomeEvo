import { toast } from "@/hooks/use-toast"

/**
 * Displays a success toast notification with the green theme.
 * @param message The main success heading.
 * @param description Optional details to show inside the toast description block.
 */
export function toastSuccess(message: string, description?: string) {
  return toast({
    title: message,
    description,
    variant: "success",
  })
}

/**
 * Displays a destructive error toast notification with the red theme.
 * @param message The main error heading.
 * @param description Optional debug details or explanations.
 */
export function toastError(message: string, description?: string) {
  return toast({
    title: message,
    description,
    variant: "destructive",
  })
}

/**
 * Displays an informational toast notification with the default neutral theme.
 * @param message The main info heading.
 * @param description Optional description sub-text.
 */
export function toastInfo(message: string, description?: string) {
  return toast({
    title: message,
    description,
    variant: "info",
  })
}
