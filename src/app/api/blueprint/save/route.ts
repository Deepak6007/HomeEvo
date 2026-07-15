import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { db } from "@/lib/db"
import { z } from "zod"
import { BlueprintRequestSchema } from "@/lib/validators/blueprint"

const BlueprintSaveSchema = z.object({
  formData: BlueprintRequestSchema,
  blueprintData: z.object({
    floorPlan: z.object({
      rooms: z.array(z.any()),
      totalArea: z.number(),
      floors: z.number()
    }),
    costEstimate: z.object({
      items: z.array(z.any()),
      subtotal: z.number(),
      contingency: z.number(),
      grandTotal: z.number()
    }),
    materialsList: z.array(z.any()),
    timeline: z.object({
      totalWeeks: z.number(),
      phases: z.array(z.any())
    }),
    recommendations: z.array(z.string())
  })
})

export async function POST(request: NextRequest) {
  // Check auth cookie
  const token = request.cookies.get("homeevo-token")?.value

  if (!token) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  let userId: string
  try {
    const secretStr = process.env.JWT_SECRET
    if (!secretStr) {
      console.error("JWT_SECRET is missing in environment variables")
      return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 })
    }

    const secret = new TextEncoder().encode(secretStr)
    const { payload } = await jwtVerify(token, secret)
    
    const role = payload.role as string
    if (!role || role.toUpperCase() !== "CLIENT") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    userId = payload.sub as string
    if (!userId) {
      return NextResponse.json({ success: false, error: "Invalid token payload" }, { status: 400 })
    }
  } catch (error) {
    console.error("JWT validation error in blueprint save endpoint:", error)
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  // Parse body
  let body
  try {
    body = await request.json()
  } catch (err) {
    return NextResponse.json({ success: false, error: "Invalid JSON request body" }, { status: 400 })
  }

  const parsed = BlueprintSaveSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ 
      success: false, 
      error: "Invalid request payload structure", 
      errors: parsed.error.flatten().fieldErrors 
    }, { status: 400 })
  }

  const { blueprintData, formData } = parsed.data

  try {
    // Save to database
    const saved = await db.blueprintSave.create({
      data: {
        userId,
        formData: formData as any,
        blueprintData: blueprintData as any,
      }
    })

    return NextResponse.json({ success: true, shareId: saved.id })
  } catch (error: any) {
    console.error("Failed to save blueprint:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to save blueprint" 
    }, { status: 500 })
  }
}
