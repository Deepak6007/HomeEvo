import { z } from "zod"

export const BlueprintRequestSchema = z.object({
  description: z.string()
    .min(30, "Please describe your home in at least 30 characters")
    .max(2000, "Description too long — max 2000 characters"),
  landSize: z.number()
    .min(500, "Land size must be at least 500 sq ft")
    .max(50000, "Land size cannot exceed 50,000 sq ft"),
  floors: z.number().int().min(1).max(5),
  style: z.enum(['Modern', 'Traditional', 'Fusion', 'Vastu-Compliant']),
  budgetMin: z.number().min(500000),   // ₹5L minimum
  budgetMax: z.number().max(50000000), // ₹5Cr maximum
}).refine(
  (data) => data.budgetMax > data.budgetMin,
  {
    message: "Maximum budget must be greater than minimum budget",
    path: ["budgetMax"],
  }
)

export type BlueprintRequest = z.infer<typeof BlueprintRequestSchema>

export type BlueprintResponse = {
  floorPlan: {
    rooms: Array<{
      name: string        // e.g. "Master Bedroom", "Kitchen", "Pooja Room"
      width: number       // in feet
      length: number      // in feet
      area: number        // sq ft (width × length)
      floor: number       // 1, 2, 3 etc.
      type: 'bedroom' | 'bathroom' | 'kitchen' | 'living' |
            'dining' | 'utility' | 'pooja' | 'garage' | 'other'
    }>
    totalArea: number     // total built-up area in sq ft
    floors: number
  }
  costEstimate: {
    items: Array<{
      category: string    // e.g. "Foundation", "Structure", "Electrical"
      item: string        // e.g. "M25 Concrete for Foundation"
      quantity: number
      unit: string        // "bags", "kg", "sq ft", "points", "sets"
      unitCost: number    // in INR
      totalCost: number   // quantity × unitCost
    }>
    subtotal: number
    contingency: number   // exactly 10% of subtotal
    grandTotal: number    // subtotal + contingency
  }
  materialsList: Array<{
    material: string      // e.g. "OPC 53 Grade Cement"
    quantity: number
    unit: string
    estimatedCost: number // in INR
    notes: string         // e.g. "Use ACC or Ultratech brand", "Buy locally in AP"
  }>
  timeline: {
    totalWeeks: number
    phases: Array<{
      name: string        // e.g. "Foundation & Plinth"
      weeks: number       // duration in weeks
      description: string // what happens in this phase
    }>
  }
  recommendations: string[] // practical advice for AP construction
}
