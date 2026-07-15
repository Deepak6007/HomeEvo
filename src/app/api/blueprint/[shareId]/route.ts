import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  const { shareId } = params

  if (!shareId) {
    return NextResponse.json({ success: false, error: "Missing share ID" }, { status: 400 })
  }

  try {
    const saved = await db.blueprintSave.findUnique({
      where: { id: shareId },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    })

    if (!saved) {
      return NextResponse.json({ success: false, error: "Blueprint not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        blueprintData: saved.blueprintData,
        formData: saved.formData,
        createdAt: saved.createdAt,
        userName: saved.user?.name || "Client User"
      }
    })
  } catch (error: any) {
    console.error("Failed to fetch shared blueprint:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to fetch shared blueprint" 
    }, { status: 500 })
  }
}
