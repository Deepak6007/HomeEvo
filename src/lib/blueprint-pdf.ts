import { BlueprintResponse } from "./validators/blueprint"

function formatINR(num: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

export async function downloadBlueprintPDF(data: BlueprintResponse): Promise<void> {
  const { default: jsPDF } = await import("jspdf")
  const { default: autoTable } = await import("jspdf-autotable")

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  })

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Theme Colors
  const ORANGE: [number, number, number] = [232, 93, 4] // #E85D04
  const BROWN_TEXT: [number, number, number] = [61, 43, 31] // #3D2B1F
  const GREY_TEXT: [number, number, number] = [111, 91, 75] // #6F5B4B
  const CREAM_BG: [number, number, number] = [253, 248, 242] // #FDF8F2

  const defaultTableStyles = {
    headStyles: { fillColor: ORANGE, textColor: [255, 255, 255] as [number, number, number], fontStyle: 'bold' as const, fontSize: 9 },
    bodyStyles: { textColor: BROWN_TEXT, fontSize: 9 },
    alternateRowStyles: { fillColor: [250, 245, 240] as [number, number, number] },
    margin: { top: 22, bottom: 20, left: 15, right: 15 },
    theme: 'grid' as const
  }

  // -------------------------------------------------------------
  // PAGE 1 — COVER SHEET
  // -------------------------------------------------------------
  doc.setFillColor(CREAM_BG[0], CREAM_BG[1], CREAM_BG[2])
  doc.rect(0, 0, 210, 297, "F")

  // Decorative header band
  doc.setFillColor(ORANGE[0], ORANGE[1], ORANGE[2])
  doc.rect(0, 0, 210, 15, "F")

  // Logo
  doc.setFont("helvetica", "bold")
  doc.setFontSize(28)
  doc.setTextColor(ORANGE[0], ORANGE[1], ORANGE[2])
  doc.text("HomeEvo", 20, 70)
  
  doc.setDrawColor(ORANGE[0], ORANGE[1], ORANGE[2])
  doc.setLineWidth(1)
  doc.line(20, 76, 75, 76)

  // Title
  doc.setFont("helvetica", "bold")
  doc.setFontSize(20)
  doc.setTextColor(BROWN_TEXT[0], BROWN_TEXT[1], BROWN_TEXT[2])
  doc.text("AI-Generated Home Construction Blueprint", 20, 100)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(12)
  doc.setTextColor(GREY_TEXT[0], GREY_TEXT[1], GREY_TEXT[2])
  doc.text(`Generated on: ${formattedDate}`, 20, 110)

  // Details box
  doc.setFillColor(255, 255, 255)
  doc.rect(20, 130, 170, 75, "F")
  doc.setDrawColor(230, 220, 210)
  doc.setLineWidth(0.5)
  doc.rect(20, 130, 170, 75, "S")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.setTextColor(ORANGE[0], ORANGE[1], ORANGE[2])
  doc.text("PROJECT OVERVIEW", 30, 142)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(BROWN_TEXT[0], BROWN_TEXT[1], BROWN_TEXT[2])
  
  doc.text("Total Built-up Area:", 30, 155)
  doc.setFont("helvetica", "normal")
  doc.text(`${data.floorPlan.totalArea} sq ft`, 85, 155)

  doc.setFont("helvetica", "bold")
  doc.text("Number of Floors:", 30, 165)
  doc.setFont("helvetica", "normal")
  doc.text(`${data.floorPlan.floors} Floor(s)`, 85, 165)

  doc.setFont("helvetica", "bold")
  doc.text("Total Estimated Cost:", 30, 175)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(ORANGE[0], ORANGE[1], ORANGE[2])
  doc.text(formatINR(data.costEstimate.grandTotal), 85, 175)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(GREY_TEXT[0], GREY_TEXT[1], GREY_TEXT[2])
  doc.text("Note: This is an AI-generated initial design report based on AP 2025 construction rates.", 20, 240)
  doc.text("Verify structural parameters with local licensed structural engineers before execution.", 20, 246)

  // -------------------------------------------------------------
  // PAGE 2 — FLOOR PLAN DETAIL
  // -------------------------------------------------------------
  doc.addPage("a4", "portrait")
  
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(ORANGE[0], ORANGE[1], ORANGE[2])
  doc.text("Floor Plan Specifications", 15, 25)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9.5)
  doc.setTextColor(GREY_TEXT[0], GREY_TEXT[1], GREY_TEXT[2])
  doc.text("The visual vector floor plans are available inside the HomeEvo Client Dashboard. Below is a detailed text representation of the room layouts and structural dimensions.", 15, 31, { maxWidth: 180 })

  const roomHeaders = [["Room Name", "Floor", "Width (ft)", "Length (ft)", "Area (sq ft)", "Type"]]
  const roomRows = data.floorPlan.rooms.map(room => [
    room.name,
    `Floor ${room.floor}`,
    `${room.width} ft`,
    `${room.length} ft`,
    `${room.area} sq ft`,
    room.type.toUpperCase()
  ])

  autoTable(doc, {
    ...defaultTableStyles,
    startY: 42,
    head: roomHeaders,
    body: roomRows,
    foot: [
      [
        { content: "Total Built-up Area:", colSpan: 4, styles: { halign: "right" as const, fontStyle: "bold" as const } },
        { content: `${data.floorPlan.totalArea} sq ft`, styles: { fontStyle: "bold" as const, textColor: ORANGE } },
        ""
      ]
    ]
  })

  // -------------------------------------------------------------
  // PAGE 3 — COST ESTIMATE (LANDSCAPE)
  // -------------------------------------------------------------
  doc.addPage("a4", "landscape")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(ORANGE[0], ORANGE[1], ORANGE[2])
  doc.text("Cost Estimation Breakdown (AP Market Rates)", 15, 25)

  const costHeaders = [["Item Description", "Category", "Quantity", "Unit", "Unit Cost (INR)", "Total (INR)"]]
  const costRows: any[] = []

  let currentCategory = ""
  data.costEstimate.items.forEach(item => {
    // Add category header spacing row
    if (item.category !== currentCategory) {
      currentCategory = item.category
      costRows.push([
        { content: currentCategory.toUpperCase(), colSpan: 6, styles: { fillColor: [248, 240, 230], fontStyle: "bold" as const, textColor: ORANGE } }
      ])
    }
    costRows.push([
      item.item,
      item.category,
      item.quantity.toLocaleString("en-IN"),
      item.unit,
      formatINR(item.unitCost),
      formatINR(item.totalCost)
    ])
  })

  // Subtotals
  costRows.push([
    { content: "Subtotal", colSpan: 5, styles: { halign: "right" as const, fontStyle: "bold" as const } },
    { content: formatINR(data.costEstimate.subtotal), styles: { fontStyle: "bold" as const } }
  ])
  costRows.push([
    { content: "Contingency (10%)", colSpan: 5, styles: { halign: "right" as const, fontStyle: "bold" as const, textColor: [217, 119, 6] } },
    { content: formatINR(data.costEstimate.contingency), styles: { fontStyle: "bold" as const, textColor: [217, 119, 6] } }
  ])
  costRows.push([
    { content: "Grand Total", colSpan: 5, styles: { halign: "right" as const, fontStyle: "bold" as const, textColor: ORANGE } },
    { content: formatINR(data.costEstimate.grandTotal), styles: { fontStyle: "bold" as const, textColor: ORANGE, fontSize: 10 } }
  ])

  autoTable(doc, {
    ...defaultTableStyles,
    startY: 32,
    head: costHeaders,
    body: costRows,
  })

  // -------------------------------------------------------------
  // PAGE 4 — MATERIALS LIST (PORTRAIT)
  // -------------------------------------------------------------
  doc.addPage("a4", "portrait")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(ORANGE[0], ORANGE[1], ORANGE[2])
  doc.text("Required Construction Materials Quota", 15, 25)

  const matHeaders = [["Material Name", "Quantity", "Unit", "Estimated Cost", "AP Brand / Sourcing Notes"]]
  const matRows: any[][] = data.materialsList.map(m => [
    m.material,
    m.quantity.toLocaleString("en-IN"),
    m.unit,
    formatINR(m.estimatedCost),
    m.notes
  ])

  // Total material cost sum
  const totalMatCost = data.materialsList.reduce((acc, m) => acc + m.estimatedCost, 0)
  matRows.push([
    { content: "Estimated Materials Subtotal:", colSpan: 3, styles: { halign: "right" as const, fontStyle: "bold" as const } },
    { content: formatINR(totalMatCost), styles: { fontStyle: "bold" as const, textColor: ORANGE } },
    ""
  ])

  autoTable(doc, {
    ...defaultTableStyles,
    startY: 32,
    head: matHeaders,
    body: matRows,
  })

  // -------------------------------------------------------------
  // PAGE 5 — TIMELINE (PORTRAIT)
  // -------------------------------------------------------------
  doc.addPage("a4", "portrait")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(ORANGE[0], ORANGE[1], ORANGE[2])
  doc.text("Construction Timeline & Milestones", 15, 25)

  const timelineHeaders = [["Phase / Milestone Name", "Duration (Weeks)", "Phase Work Description"]]
  const timelineRows = data.timeline.phases.map(p => [
    p.name,
    `${p.weeks} Weeks`,
    p.description
  ])

  autoTable(doc, {
    ...defaultTableStyles,
    startY: 32,
    head: timelineHeaders,
    body: timelineRows,
    foot: [
      [
        { content: "Total Planned Duration:", colSpan: 1, styles: { halign: "right" as const, fontStyle: "bold" as const } },
        { content: `${data.timeline.totalWeeks} Weeks (~${Math.round(data.timeline.totalWeeks / 4.3)} Months)`, colSpan: 2, styles: { fontStyle: "bold" as const, textColor: ORANGE } }
      ]
    ]
  })

  // -------------------------------------------------------------
  // PAGE 6 — RECOMMENDATIONS (PORTRAIT)
  // -------------------------------------------------------------
  doc.addPage("a4", "portrait")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(ORANGE[0], ORANGE[1], ORANGE[2])
  doc.text("Regional Construction Recommendations", 15, 25)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9.5)
  doc.setTextColor(GREY_TEXT[0], GREY_TEXT[1], GREY_TEXT[2])
  doc.text("Specific recommendations for building in Andhra Pradesh, taking weather, local rules, and logistics into account.", 15, 31, { maxWidth: 180 })

  const recHeaders = [["#", "Building Recommendation Details"]]
  const recRows = data.recommendations.map((rec, idx) => [
    (idx + 1).toString(),
    rec
  ])

  autoTable(doc, {
    ...defaultTableStyles,
    startY: 42,
    head: recHeaders,
    body: recRows,
    columnStyles: {
      0: { cellWidth: 10, fontStyle: "bold" as const, textColor: ORANGE },
      1: { cellWidth: 170 }
    }
  })

  // -------------------------------------------------------------
  // GLOBAL HEADERS & FOOTERS (Post-Generation Stamp)
  // -------------------------------------------------------------
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    if (i === 1) continue // Skip header/footer on cover page

    const pageSize = doc.internal.pageSize
    const pageW = pageSize.width || pageSize.getWidth()
    const pageH = pageSize.height || pageSize.getHeight()

    // Header
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.5)
    doc.setTextColor(GREY_TEXT[0], GREY_TEXT[1], GREY_TEXT[2])
    doc.text("HomeEvo AI Blueprint Generator", 15, 11)
    doc.text(formattedDate, pageW - 15, 11, { align: "right" })

    // Header Line
    doc.setDrawColor(ORANGE[0], ORANGE[1], ORANGE[2])
    doc.setLineWidth(0.4)
    doc.line(15, 14, pageW - 15, 14)

    // Footer Line
    doc.setDrawColor(220, 210, 200)
    doc.line(15, pageH - 14, pageW - 15, pageH - 14)

    // Footer
    doc.text("Generated by HomeEvo AI — Andhra Pradesh Construction Portal", 15, pageH - 9)
    doc.text(`Page ${i} of ${pageCount}`, pageW - 15, pageH - 9, { align: "right" })
  }

  // Save the generated file
  const dateStr = new Date().toISOString().slice(0, 10)
  doc.save(`homeevo-blueprint-${dateStr}.pdf`)
}
