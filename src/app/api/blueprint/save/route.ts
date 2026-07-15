import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { db } from "@/lib/db"

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

  const { blueprintData, formData } = body
  if (!blueprintData || !formData) {
    return NextResponse.json({ success: false, error: "Missing blueprintData or formData" }, { status: 400 })
  }

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
