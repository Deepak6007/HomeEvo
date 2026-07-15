import * as React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BidComposer } from "../BidComposer"
import { toast } from "sonner"

// Mock the hook dependencies
const mockMutate = jest.fn()
jest.mock("@/hooks/vendor/bids", () => ({
  useCreateBid: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}))

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

describe("BidComposer Component", () => {
  const defaultProps = {
    leadId: "lead-123",
    leadBudget: "₹5,00,000",
    isOpen: true,
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("renders correctly in step 1", () => {
    render(<BidComposer {...defaultProps} />)
    
    expect(screen.getByText("SUBMIT BID PROPOSAL")).toBeInTheDocument()
    expect(screen.getByText("PROPOSAL BID AMOUNT (₹)")).toBeInTheDocument()
    expect(screen.getByText("ESTIMATED DURATION")).toBeInTheDocument()
    expect(screen.getByText("PROPOSAL MESSAGE")).toBeInTheDocument()
  })

  test("validates step 1 inputs and shows errors", async () => {
    render(<BidComposer {...defaultProps} />)
    
    const nextBtn = screen.getByText("Next")
    fireEvent.click(nextBtn)

    // Should call toast.error indicating validation failed
    expect(toast.error).toHaveBeenCalledWith("Please resolve the errors in Step 1.")

    // Fields should display validation errors
    // Amount must be positive, description must be >= 10 chars
    expect(screen.getByText("Amount must be greater than 0")).toBeInTheDocument()
    expect(screen.getByText("Proposal message must be at least 10 characters long")).toBeInTheDocument()
  })

  test("proceeds to step 2 with valid step 1 data", async () => {
    render(<BidComposer {...defaultProps} />)

    const amountInput = screen.getByPlaceholderText("e.g. 50000")
    const descTextarea = screen.getByPlaceholderText(/Introduce your team/i)
    
    // Fill in valid details
    fireEvent.change(amountInput, { target: { value: "50000" } })
    fireEvent.change(descTextarea, { target: { value: "This is a detailed proposal message for the work." } })

    const nextBtn = screen.getByText("Next")
    fireEvent.click(nextBtn)

    // Check that we moved to step 2
    expect(screen.getByText(/Milestone sum: ₹50,000 \/ Target: ₹50,000/i)).toBeInTheDocument()
  })

  test("validates milestone sum matches total bid in step 2", async () => {
    render(<BidComposer {...defaultProps} />)

    // Fill Step 1
    fireEvent.change(screen.getByPlaceholderText("e.g. 50000"), { target: { value: "50000" } })
    fireEvent.change(screen.getByPlaceholderText(/Introduce your team/i), { target: { value: "This is a detailed proposal message for the work." } })
    fireEvent.click(screen.getByText("Next"))

    // Current default milestones sum:
    // Initial Advance: 15000
    // Core Execution: 25000
    // Final Handover: 10000
    // Total: 50000. It matches our target 50000. Let's make it mismatch.
    
    // Let's modify a milestone amount to create a mismatch
    const milestoneAmountInputs = screen.getAllByPlaceholderText("Amount (₹)")
    // Change first milestone from 15000 to 20000
    fireEvent.change(milestoneAmountInputs[0], { target: { value: "20000" } })

    // Milestone sum is now 55000, target is 50000. Mismatch!
    fireEvent.click(screen.getByText("Next"))

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Total milestone amounts (₹55,000) must sum exactly to the bid amount (₹50,000)")
    )
  })

  test("can add and remove milestones in step 2", async () => {
    render(<BidComposer {...defaultProps} />)

    // Fill Step 1
    fireEvent.change(screen.getByPlaceholderText("e.g. 50000"), { target: { value: "50000" } })
    fireEvent.change(screen.getByPlaceholderText(/Introduce your team/i), { target: { value: "This is a detailed proposal message for the work." } })
    fireEvent.click(screen.getByText("Next"))

    // Default milestones count is 3
    expect(screen.getByText("MILESTONE #1")).toBeInTheDocument()
    expect(screen.getByText("MILESTONE #2")).toBeInTheDocument()
    expect(screen.getByText("MILESTONE #3")).toBeInTheDocument()

    // Add milestone
    const addBtn = screen.getByText("Add Escrow Milestone")
    fireEvent.click(addBtn)

    expect(screen.getByText("MILESTONE #4")).toBeInTheDocument()

    // Click trash button on MILESTONE #4 to remove it
    // Get all buttons in the milestones list. The trash buttons have class containing transition-colors
    const trashButtons = screen.getAllByRole("button").filter(
      (btn) => btn.querySelector("svg")?.classList.contains("lucide-trash2")
    )
    // There should be 4 trash buttons now
    expect(trashButtons.length).toBe(4)
    
    fireEvent.click(trashButtons[3])
    
    // Milestone count should return to 3
    expect(screen.queryByText("MILESTONE #4")).not.toBeInTheDocument()
  })

  test("navigates to step 3 and submits the proposal on validation success", async () => {
    render(<BidComposer {...defaultProps} />)

    // Step 1
    fireEvent.change(screen.getByPlaceholderText("e.g. 50000"), { target: { value: "50000" } })
    fireEvent.change(screen.getByPlaceholderText(/Introduce your team/i), { target: { value: "This is a detailed proposal message for the work." } })
    fireEvent.click(screen.getByText("Next"))

    // Step 2 (Defaults sum to exactly 50000, so we can proceed directly)
    fireEvent.click(screen.getByText("Next"))

    // Step 3 Review
    expect(screen.getByText("PROPOSAL SUMMARY")).toBeInTheDocument()
    expect(screen.getByText("₹50,000")).toBeInTheDocument()

    // Mock mutate resolution to execute onSuccess callback
    mockMutate.mockImplementationOnce((variables, config) => {
      if (config && config.onSuccess) {
        config.onSuccess(null, variables, null)
      }
    })

    const submitBtn = screen.getByText("Submit Proposal")
    fireEvent.click(submitBtn)

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        leadId: "lead-123",
        payload: expect.objectContaining({
          amount: 50000,
          timeline: "4 Weeks",
          description: "This is a detailed proposal message for the work.",
          milestones: expect.any(Array)
        })
      }),
      expect.any(Object)
    )

    expect(toast.success).toHaveBeenCalledWith("Proposal submitted successfully!")
    expect(defaultProps.onClose).toHaveBeenCalled()
  })
})
