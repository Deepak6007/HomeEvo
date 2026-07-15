import { z } from "zod"

// 1. Define schema for client-facing variables (prefixed with NEXT_PUBLIC_)
// These are validated on both client and server.
const clientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url("NEXT_PUBLIC_API_URL must be a valid absolute HTTP(S) URL"),
  NEXT_PUBLIC_RAZORPAY_KEY: z.string().min(1, "NEXT_PUBLIC_RAZORPAY_KEY must be configured"),
  NEXT_PUBLIC_WS_URL: z.string().min(1, "NEXT_PUBLIC_WS_URL WebSocket server address must be configured"),
})

// 2. Define schema for server-only variables
// These are validated ONLY when running on the server (Node environment).
const serverSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection URL").optional(),
  REDIS_URL: z.string().url("REDIS_URL must be a valid Redis connection URL").optional(),
  JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 characters long for production security"),
  HF_TOKEN: z.string().min(1, "HF_TOKEN must be configured for LLM integration").optional(),
  HF_MODEL: z.string().min(1).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
  RAZORPAY_KEY_ID: z.string().min(1).optional(),
  RAZORPAY_KEY_SECRET: z.string().min(1).optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1).optional(),
})

const isServer = typeof window === "undefined"

// Helper object wrapping process.env variables
const envProcess = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_RAZORPAY_KEY: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  HF_TOKEN: process.env.HF_TOKEN,
  HF_MODEL: process.env.HF_MODEL,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
}

// Perform validation on Client options
const clientParsed = clientSchema.safeParse(envProcess)
if (!clientParsed.success) {
  console.error("❌ Invalid client environment variables:")
  console.error(JSON.stringify(clientParsed.error.format(), null, 2))
  throw new Error("Invalid client environment variables configured. Check local env configs.")
}

let serverParsed = { success: true, data: {} }
if (isServer) {
  // Perform validation on Server options only in Node context
  const parsed = serverSchema.safeParse(envProcess)
  if (!parsed.success) {
    console.error("❌ Invalid server environment variables:")
    console.error(JSON.stringify(parsed.error.format(), null, 2))
    throw new Error("Invalid server environment variables configured. Blocked build setup.")
  }
  serverParsed = parsed
}

export const env = {
  ...clientParsed.data,
  ...(isServer && serverParsed.success ? (serverParsed.data as any) : {}),
}
