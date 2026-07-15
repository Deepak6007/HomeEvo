"use client"

import * as React from "react"
import Image from "next/image"
import { UploadCloud, FileText, Image as ImageIcon, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"

export interface FileUploadProps {
  /** Accepted file MIME types/extensions (e.g. "image/*,application/pdf") */
  accept?: string
  /** Allow selection of multiple files */
  multiple?: boolean
  /** Callback triggered when files are validated and uploaded */
  onUpload: (files: File[]) => void
  /** Maximum file size limit in bytes */
  maxSize?: number
  /** Heading label for the upload zone */
  label?: string
  /** Subtitle/instruction text */
  description?: string
  /** Additional wrapper CSS classes */
  className?: string
}

/**
 * FileUpload provides an interactive drag-and-drop file drop zone.
 * It enforces size and type validations, handles browse-to-click, and
 * generates reactive thumbnail previews for image files.
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  multiple = false,
  onUpload,
  maxSize,
  label = "Upload files",
  description = "Drag and drop files here or click to browse",
  className,
}) => {
  const [isDragActive, setIsDragActive] = React.useState(false)
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [error, setError] = React.useState<string | null>(null)
  
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = React.useState<{ [key: string]: string }>({})

  // Clean up object URLs to prevent memory leaks when files change or on unmount
  React.useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previews])

  const validateFile = (file: File): boolean => {
    // 1. Size Validation
    if (maxSize && file.size > maxSize) {
      const sizeInMB = (maxSize / (1024 * 1024)).toFixed(1)
      setError(`File "${file.name}" exceeds the maximum limit of ${sizeInMB}MB.`)
      return false
    }

    // 2. MIME Type Validation
    if (accept) {
      const acceptedTypes = accept.split(",").map((t) => t.trim())
      const isAccepted = acceptedTypes.some((type) => {
        if (type.startsWith(".")) {
          // Extension check (e.g. ".pdf")
          return file.name.toLowerCase().endsWith(type.toLowerCase())
        }
        if (type.endsWith("/*")) {
          // Wildcard check (e.g. "image/*")
          const baseType = type.split("/")[0]
          return file.type.startsWith(`${baseType}/`)
        }
        // Exact MIME check (e.g. "application/pdf")
        return file.type === type
      })

      if (!isAccepted) {
        setError(`File "${file.name}" does not match acceptable formats (${accept}).`)
        return false
      }
    }

    return true
  }

  const processFiles = (fileList: FileList) => {
    setError(null)
    const validFiles: File[] = []
    const limit = multiple ? fileList.length : 1
    
    for (let i = 0; i < limit; i++) {
      const file = fileList[i]
      if (validateFile(file)) {
        validFiles.push(file)
      } else {
        return // Stop processing if any file fails validation
      }
    }

    if (validFiles.length > 0) {
      let updatedFiles = []
      if (multiple) {
        updatedFiles = [...selectedFiles, ...validFiles]
      } else {
        // Revoke old single preview if it exists
        if (selectedFiles.length > 0) {
          const oldFile = selectedFiles[0]
          const oldKey = `${oldFile.name}-${oldFile.size}`
          if (previews[oldKey]) {
            URL.revokeObjectURL(previews[oldKey])
          }
        }
        updatedFiles = validFiles
      }

      // Generate object URLs for image preview thumbnails
      const newPreviews = { ...previews }
      validFiles.forEach((file) => {
        if (file.type.startsWith("image/")) {
          newPreviews[`${file.name}-${file.size}`] = URL.createObjectURL(file)
        }
      })

      setPreviews(newPreviews)
      setSelectedFiles(updatedFiles)
      onUpload(updatedFiles)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files)
    }
  }

  const onButtonClick = () => {
    fileInputRef.current?.click()
  }

  const removeFile = (idxToRemove: number) => {
    const file = selectedFiles[idxToRemove]
    const key = `${file.name}-${file.size}`
    
    if (previews[key]) {
      URL.revokeObjectURL(previews[key])
      const nextPreviews = { ...previews }
      delete nextPreviews[key]
      setPreviews(nextPreviews)
    }

    const nextFiles = selectedFiles.filter((_, idx) => idx !== idxToRemove)
    setSelectedFiles(nextFiles)
    onUpload(nextFiles)
  }

  return (
    <div className={cn("space-y-4 w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        aria-label="Upload files"
      />

      {/* Drop Zone Box */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={cn(
          "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 select-none",
          isDragActive
            ? "border-orange bg-orange/5"
            : "border-border/80 bg-muted/5 hover:border-orange hover:bg-muted/10"
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-warm dark:bg-dark-3 text-orange mb-3 border border-border/20 shadow-2xs">
          <UploadCloud className="h-6 w-6" />
        </div>
        
        <h4 className="text-sm font-medium text-foreground tracking-tight mb-1">
          {label}
        </h4>
        
        <p className="text-xs text-muted-foreground tracking-wide font-normal text-center leading-relaxed max-w-[250px]">
          {description}
        </p>
      </div>

      {/* Validation Error Alert */}
      {error && (
        <div className="flex items-start gap-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/10">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Previews & File List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2.5">
          <span className="text-xs font-semibold text-foreground tracking-wider uppercase">
            Selected Files ({selectedFiles.length})
          </span>
          
          <div className="grid gap-2">
            {selectedFiles.map((file, idx) => {
              const key = `${file.name}-${file.size}`
              const previewUrl = previews[key]
              const sizeInKB = (file.size / 1024).toFixed(0)

              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-card shadow-2xs hover:border-border/100"
                >
                  <div className="flex items-center gap-3 overflow-hidden mr-2">
                    {/* Thumbnail Preview Area */}
                    {previewUrl ? (
                      <div className="h-9 w-9 rounded-md overflow-hidden border border-border shrink-0 bg-muted flex items-center justify-center">
                        <Image
                          src={previewUrl}
                          alt="Thumbnail preview"
                          width={36}
                          height={36}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-9 w-9 rounded-md border border-border shrink-0 bg-muted/50 text-muted-foreground flex items-center justify-center">
                        {file.type.startsWith("image/") ? (
                          <ImageIcon className="h-4.5 w-4.5" />
                        ) : (
                          <FileText className="h-4.5 w-4.5" />
                        )}
                      </div>
                    )}
                    
                    <div className="overflow-hidden">
                      <span className="text-sm font-medium text-foreground tracking-tight block truncate max-w-[200px] sm:max-w-[300px]">
                        {file.name}
                      </span>
                      <span className="text-xs text-muted-foreground font-normal block">
                        {sizeInKB} KB
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(idx)
                    }}
                    className="text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
