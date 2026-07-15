import * as React from "react"
import { render, screen } from "@testing-library/react"
import { StatCard } from "../StatCard"
import { TrendingUp } from "lucide-react"

describe("StatCard Component", () => {
  const defaultProps = {
    label: "Total Projects",
    value: "₹4,20,000",
  }

  test("renders label and value correctly", () => {
    render(<StatCard {...defaultProps} />)
    expect(screen.getByText("Total Projects")).toBeInTheDocument()
    expect(screen.getByText("₹4,20,000")).toBeInTheDocument()
  })

  test("renders custom icon if provided", () => {
    render(<StatCard {...defaultProps} icon={<TrendingUp data-testid="trending-icon" />} />)
    expect(screen.getByTestId("trending-icon")).toBeInTheDocument()
  })

  test("shows skeleton loader instead of values when isLoading is true", () => {
    render(<StatCard {...defaultProps} isLoading={true} />)
    // Label and value should not be visible
    expect(screen.queryByText("Total Projects")).not.toBeInTheDocument()
    expect(screen.queryByText("₹4,20,000")).not.toBeInTheDocument()
  })

  test("renders 'up' change direction correctly with styles and icon", () => {
    const changeProp = {
      value: "+12.5%",
      direction: "up" as const,
    }
    const { container } = render(<StatCard {...defaultProps} change={changeProp} />)
    
    expect(screen.getByText("+12.5%")).toBeInTheDocument()
    expect(screen.getByText("vs last month")).toBeInTheDocument()
    
    // ArrowUpRight icon check (has class lucide-arrow-up-right)
    const arrowIcon = container.querySelector(".lucide-arrow-up-right")
    expect(arrowIcon).toBeInTheDocument()
  })

  test("renders 'down' change direction correctly with styles and icon", () => {
    const changeProp = {
      value: "-3.2%",
      direction: "down" as const,
    }
    const { container } = render(<StatCard {...defaultProps} change={changeProp} />)
    
    expect(screen.getByText("-3.2%")).toBeInTheDocument()
    const arrowIcon = container.querySelector(".lucide-arrow-down-right")
    expect(arrowIcon).toBeInTheDocument()
  })

  test("renders 'neutral' change direction correctly with styles and icon", () => {
    const changeProp = {
      value: "0.0%",
      direction: "neutral" as const,
    }
    const { container } = render(<StatCard {...defaultProps} change={changeProp} />)
    
    expect(screen.getByText("0.0%")).toBeInTheDocument()
    const minusIcon = container.querySelector(".lucide-minus")
    expect(minusIcon).toBeInTheDocument()
  })
})
