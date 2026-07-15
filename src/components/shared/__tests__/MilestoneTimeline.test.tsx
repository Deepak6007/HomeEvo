import * as React from "react"
import { render, screen } from "@testing-library/react"
import { MilestoneTimeline, Milestone } from "../MilestoneTimeline"

describe("MilestoneTimeline Component", () => {
  const mockMilestones: Milestone[] = [
    {
      id: "m1",
      title: "Excavation and Site Prep",
      status: "released",
      amount: 150000,
      date: "2026-06-15",
    },
    {
      id: "m2",
      title: "Foundation Laying",
      status: "in_progress",
      amount: 300000,
      date: "2026-07-20",
    },
    {
      id: "m3",
      title: "Brickwork and Lintel",
      status: "pending",
      amount: 250000,
      date: "2026-08-25",
    },
    {
      id: "m4",
      title: "Finishing & Electricals",
      status: "upcoming",
      amount: 400000,
      date: "2026-10-01",
    },
  ]

  test("returns null and renders nothing if milestones list is empty or undefined", () => {
    const { container } = render(<MilestoneTimeline milestones={[]} />)
    expect(container.firstChild).toBeNull()
  })

  test("renders all milestones with their titles and formatted amounts", () => {
    render(<MilestoneTimeline milestones={mockMilestones} />)
    
    expect(screen.getByText("Excavation and Site Prep")).toBeInTheDocument()
    expect(screen.getByText("Foundation Laying")).toBeInTheDocument()
    expect(screen.getByText("Brickwork and Lintel")).toBeInTheDocument()
    expect(screen.getByText("Finishing & Electricals")).toBeInTheDocument()

    // Verifying amounts format matching Indian Rupee (₹1,50,000, ₹3,00,000, etc.)
    expect(screen.getByText("₹1,50,000")).toBeInTheDocument()
    expect(screen.getByText("₹3,00,000")).toBeInTheDocument()
    expect(screen.getByText("₹2,50,000")).toBeInTheDocument()
    expect(screen.getByText("₹4,00,000")).toBeInTheDocument()
  })

  test("renders correct status labels", () => {
    render(<MilestoneTimeline milestones={mockMilestones} />)
    
    expect(screen.getByText("Released")).toBeInTheDocument()
    expect(screen.getByText("In Progress")).toBeInTheDocument()
    expect(screen.getByText("Pending Approval")).toBeInTheDocument()
    expect(screen.getByText("Upcoming")).toBeInTheDocument()
  })

  test("assigns correct classes based on status", () => {
    const { container } = render(<MilestoneTimeline milestones={mockMilestones} />)
    
    // Find the status dot indicators (the span elements with dotClass)
    // m1 (released) has dotClass = "bg-green-500 ring-4 ring-green-500/10 text-white"
    // m2 (in_progress) has dotClass = "bg-orange ring-4 ring-orange/20 text-white animate-pulse"
    // m3 (pending) has dotClass = "bg-amber-500 ring-4 ring-amber-500/10 text-white"
    // m4 (upcoming) has dotClass = "bg-muted-foreground/30 ring-4 ring-muted-foreground/5 text-muted-foreground"
    
    const dots = container.querySelectorAll("span.absolute.-left-9")
    expect(dots.length).toBe(4)

    expect(dots[0]).toHaveClass("bg-green-500")
    expect(dots[1]).toHaveClass("bg-orange")
    expect(dots[1]).toHaveClass("animate-pulse")
    expect(dots[2]).toHaveClass("bg-amber-500")
    expect(dots[3]).toHaveClass("bg-muted-foreground/30")
  })
})
