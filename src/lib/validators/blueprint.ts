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

export const BlueprintResponseSchema = z.object({
  floorPlan: z.object({
    rooms: z.array(
      z.object({
        name: z.string(),
        width: z.number(),
        length: z.number(),
        area: z.number(),
        floor: z.number(),
        type: z.enum(['bedroom', 'bathroom', 'kitchen', 'living', 'dining', 'utility', 'pooja', 'garage', 'other'])
      })
    ),
    totalArea: z.number(),
    floors: z.number()
  }),
  costEstimate: z.object({
    items: z.array(
      z.object({
        category: z.string(),
        item: z.string(),
        quantity: z.number(),
        unit: z.string(),
        unitCost: z.number(),
        totalCost: z.number()
      })
    ),
    subtotal: z.number(),
    contingency: z.number(),
    grandTotal: z.number()
  }),
  materialsList: z.array(
    z.object({
      material: z.string(),
      quantity: z.number(),
      unit: z.string(),
      estimatedCost: z.number(),
      notes: z.string()
    })
  ),
  timeline: z.object({
    totalWeeks: z.number(),
    phases: z.array(
      z.object({
        name: z.string(),
        weeks: z.number(),
        description: z.string()
      })
    )
  }),
  recommendations: z.array(z.string())
})

export type BlueprintResponse = z.infer<typeof BlueprintResponseSchema>
