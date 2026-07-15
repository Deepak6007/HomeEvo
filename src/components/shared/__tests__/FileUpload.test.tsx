import * as React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { FileUpload } from "../FileUpload"

describe("FileUpload Component", () => {
  const mockOnUpload = jest.fn()

  const defaultProps = {
    onUpload: mockOnUpload,
    label: "Drop blueprints here",
    description: "Supports PDF and Images",
  }

  beforeEach(() => {
    mockOnUpload.mockClear()
  })

  test("renders drop zone labels correctly", () => {
    render(<FileUpload {...defaultProps} />)
    expect(screen.getByText("Drop blueprints here")).toBeInTheDocument()
    expect(screen.getByText("Supports PDF and Images")).toBeInTheDocument()
  })

  test("accepts files within size limit and triggers onUpload", () => {
    render(<FileUpload {...defaultProps} maxSize={1024 * 1024} />) // 1MB limit

    const file = new File(["dummy content"], "blueprint.pdf", {
      type: "application/pdf",
    })

    // Grab the hidden input element
    const input = screen.getByLabelText(/upload files/i, { selector: 'input' }) as HTMLInputElement
    
    // Simulate selecting file
    fireEvent.change(input, { target: { files: [file] } })

    // Valid file should call onUpload
    expect(mockOnUpload).toHaveBeenCalledTimes(1)
    expect(mockOnUpload).toHaveBeenCalledWith([file])
    expect(screen.queryByText(/exceeds the maximum limit/)).not.toBeInTheDocument()
  })

  test("rejects files exceeding the maxSize limit and displays error", () => {
    render(<FileUpload {...defaultProps} maxSize={1024 * 1024} />) // 1MB limit

    // Create a 2MB file
    const largeFile = new File(["x".repeat(2 * 1024 * 1024)], "huge-plan.dwg", {
      type: "application/octet-stream",
    })

    const input = screen.getByLabelText(/upload files/i, { selector: 'input' }) as HTMLInputElement
    fireEvent.change(input, { target: { files: [largeFile] } })

    // Should not call onUpload
    expect(mockOnUpload).not.toHaveBeenCalled()
    expect(screen.getByText(/exceeds the maximum limit of 1.0MB/)).toBeInTheDocument()
  })

  test("validates accepted file MIME types and extensions", () => {
    render(<FileUpload {...defaultProps} accept="image/*,application/pdf" />)

    const invalidFile = new File(["hello"], "document.txt", {
      type: "text/plain",
    })

    const input = screen.getByLabelText(/upload files/i, { selector: 'input' }) as HTMLInputElement
    fireEvent.change(input, { target: { files: [invalidFile] } })

    expect(mockOnUpload).not.toHaveBeenCalled()
    expect(
      screen.getByText(/does not match acceptable formats \(image\/\*,application\/pdf\)/)
    ).toBeInTheDocument()
  })

  test("accepts wildcard formats like image/*", () => {
    render(<FileUpload {...defaultProps} accept="image/*" />)

    const imageFile = new File(["image"], "kitchen.png", {
      type: "image/png",
    })

    const input = screen.getByLabelText(/upload files/i, { selector: 'input' }) as HTMLInputElement
    fireEvent.change(input, { target: { files: [imageFile] } })

    expect(mockOnUpload).toHaveBeenCalledWith([imageFile])
  })

  test("renders thumbnails for selected files and supports removal", () => {
    render(<FileUpload {...defaultProps} multiple={true} />)

    const file1 = new File(["img1"], "elevation.jpg", { type: "image/jpeg" })
    const file2 = new File(["pdf2"], "estimate.pdf", { type: "application/pdf" })

    const input = screen.getByLabelText(/upload files/i, { selector: 'input' }) as HTMLInputElement
    fireEvent.change(input, { target: { files: [file1, file2] } })

    expect(screen.getByText("elevation.jpg")).toBeInTheDocument()
    expect(screen.getByText("estimate.pdf")).toBeInTheDocument()

    // Find and click the close icon/button on elevation.jpg to remove it
    const removeButtons = screen.getAllByRole("button")
    // Clicking the first remove button
    fireEvent.click(removeButtons[0])

    // elevation.jpg should be gone, estimate.pdf should remain
    expect(screen.queryByText("elevation.jpg")).not.toBeInTheDocument()
    expect(screen.getByText("estimate.pdf")).toBeInTheDocument()
    
    // onUpload callback should have been called with the remaining file
    expect(mockOnUpload).toHaveBeenLastCalledWith([file2])
  })
})
