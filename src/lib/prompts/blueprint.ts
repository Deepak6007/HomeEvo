import { BlueprintRequest } from "../validators/blueprint"

function formatINR(num: number): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(num);
}

function sanitizeDescription(desc: string): string {
  return desc
    .replace(/(system prompt|ignore previous|ignore instructions|ignore rules|instead|override|you must|respond only with|act as)/gi, "")
    .replace(/[{}<>\[\]]/g, "") // strip JSON and bracket structures
    .trim();
}

export function buildBlueprintPrompt(req: BlueprintRequest): string {
  const jsonSchemaText = `{
  "floorPlan": {
    "rooms": [
      {
        "name": "string (e.g. 'Master Bedroom', 'Kitchen', 'Pooja Room', 'Covered Parking')",
        "width": "number (width in feet)",
        "length": "number (length in feet)",
        "area": "number (width * length in sq ft)",
        "floor": "number (1, 2, 3, etc.)",
        "type": "bedroom | bathroom | kitchen | living | dining | utility | pooja | garage | other"
      }
    ],
    "totalArea": "number (total built-up area in sq ft)",
    "floors": "number (number of floors)"
  },
  "costEstimate": {
    "items": [
      {
        "category": "string (e.g. 'Foundation', 'Structure', 'Electrical', 'Plumbing', 'Finishing')",
        "item": "string (e.g. 'M25 Concrete for Foundation', 'Fe500 Steel reinforcement', 'OPC 53 Grade Cement')",
        "quantity": "number",
        "unit": "bags | kg | sq ft | points | sets | brass | tonnes | each",
        "unitCost": "number (in INR)",
        "totalCost": "number (quantity * unitCost)"
      }
    ],
    "subtotal": "number (sum of all item totalCost)",
    "contingency": "number (exactly 10% of subtotal)",
    "grandTotal": "number (subtotal + contingency)"
  },
  "materialsList": [
    {
      "material": "string (e.g. 'OPC 53 Grade Cement', 'TMT Steel (Fe500)', 'River Sand')",
      "quantity": "number",
      "unit": "string (e.g. 'bags', 'kg', 'tonnes', 'pieces')",
      "estimatedCost": "number (in INR)",
      "notes": "string (e.g. brand suggestions like UltraTech, Vizag Steel, local procurement advice in AP)"
    }
  ],
  "timeline": {
    "totalWeeks": "number (total weeks, accounting for AP seasons)",
    "phases": [
      {
        "name": "string (e.g. 'Foundation & Plinth', 'RCC Framework', 'Brickwork & Plastering', 'Finishing')",
        "weeks": "number (duration of this phase in weeks)",
        "description": "string (detailed description of activities)"
      }
    ]
  },
  "recommendations": [
    "string (practical advice for AP construction, climate, local permits, Vastu guidelines, etc.)"
  ]
}`;

  const sanitizedDesc = sanitizeDescription(req.description);

  return `Generate a detailed home construction blueprint for the following project in Andhra Pradesh, India.

PROJECT DETAILS:
- Description: ${sanitizedDesc}
- Land Size: ${req.landSize} sq ft
- Number of Floors: ${req.floors}
- Architectural Style: ${req.style}
- Budget Range: ₹${formatINR(req.budgetMin)} to ₹${formatINR(req.budgetMax)}

REQUIREMENTS — YOU MUST FOLLOW THESE EXACTLY:

1. Room layout must be practical for Indian families in AP.
   Always include: Pooja room, utility/wash area, at least one covered parking.
   If Vastu-Compliant style, position rooms according to Vastu Shastra principles.

2. Cost estimates must use CURRENT MARKET RATES for Andhra Pradesh (2025):
   - Cement (OPC 53): ₹420-450 per bag
   - TMT Steel (Fe500): ₹65-70 per kg  
   - River sand: ₹3500-4500 per tonne
   - Bricks (standard): ₹8-10 each
   - Labour (mason): ₹800-1000 per day
   - Labour (unskilled): ₹500-600 per day
   - Construction cost overall: ₹2,000-3,500 per sq ft depending on quality

3. The total cost estimate MUST fall within the provided budget range.
   If the budget is too low for the described home, scale down the design.

4. Timeline must be realistic for AP construction conditions
   (monsoon season June-September causes delays).

5. Recommendations must be specific to Andhra Pradesh:
   local material suppliers, AP climate considerations, local building codes.

RESPOND WITH VALID JSON ONLY.
No markdown, no code fences, no explanation text before or after.
Start your response directly with { and end with }.
Follow this exact JSON structure:
${jsonSchemaText}`;
}

export const SYSTEM_PROMPT = `You are a senior construction architect and civil engineer
specializing in residential homes in Andhra Pradesh, India.
You have 20 years of experience building homes across Vijayawada, Guntur,
Amaravati, Eluru, Rajahmundry, and other AP cities.

You always generate practical, cost-accurate blueprints that account for:
- AP climate (hot summers, heavy monsoons)
- Local material availability and pricing
- Vastu Shastra when requested
- AP building regulations and FSI norms
- Common Indian family requirements (joint families, pooja rooms, parking)

CRITICAL RULE: You ALWAYS respond with valid JSON only.
Never include any text, explanation, or markdown outside the JSON object.
Your entire response must be parseable by JSON.parse().
If you cannot complete a field, use a sensible default — never omit a field.`;
