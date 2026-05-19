// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import Dashboard, { aggregateTotals } from "@popup/components/Dashboard";
import type { DailyTotal } from "@shared/types";

// 7 days of mock data
const mockDailyTotals: Record<string, DailyTotal> = {
  "2026-04-08": { total_co2_grams: 10, page_count: 20 },
  "2026-04-09": { total_co2_grams: 15, page_count: 30 },
  "2026-04-10": { total_co2_grams: 8, page_count: 15 },
  "2026-04-11": { total_co2_grams: 12, page_count: 25 },
  "2026-04-12": { total_co2_grams: 20, page_count: 40 },
  "2026-04-13": { total_co2_grams: 5, page_count: 10 },
  "2026-04-14": { total_co2_grams: 18, page_count: 35 },
};

describe("aggregateTotals", () => {
  it("returns daily totals as-is for 'daily' period", () => {
    const result = aggregateTotals(mockDailyTotals, "daily");
    expect(result).toHaveLength(7);
    expect(result[0].total_co2_grams).toBe(10);
  });

  it("aggregates into weekly totals", () => {
    const result = aggregateTotals(mockDailyTotals, "weekly");
    // All 7 days fall within the same or two weeks
    const totalCo2 = result.reduce((s, r) => s + r.total_co2_grams, 0);
    expect(totalCo2).toBe(88); // 10+15+8+12+20+5+18
  });

  it("aggregates into monthly totals", () => {
    const result = aggregateTotals(mockDailyTotals, "monthly");
    // All in April 2026
    expect(result).toHaveLength(1);
    expect(result[0].total_co2_grams).toBe(88);
    expect(result[0].page_count).toBe(175);
  });

  it("handles empty data", () => {
    const result = aggregateTotals({}, "daily");
    expect(result).toHaveLength(0);
  });
});

describe("Dashboard component", () => {
  // T-035: Dashboard shows daily/weekly/monthly totals
  it("renders daily view by default (T-035)", () => {
    render(<Dashboard dailyTotals={mockDailyTotals} />);
    expect(screen.getByText(/daily/i)).toBeInTheDocument();
  });

  it("displays total CO2 in grams for the period", () => {
    const { container } = render(<Dashboard dailyTotals={mockDailyTotals} />);
    const summaryValue = container.querySelector(".totals-summary .total-value");
    expect(summaryValue).toHaveTextContent("88.00");
  });

  it("displays total page count for the period", () => {
    const { container } = render(<Dashboard dailyTotals={mockDailyTotals} />);
    const labels = container.querySelectorAll(".totals-summary .total-value");
    const pageCount = labels[1];
    expect(pageCount).toHaveTextContent("175");
  });

  it("toggles to weekly view", () => {
    render(<Dashboard dailyTotals={mockDailyTotals} />);
    fireEvent.click(screen.getByRole("button", { name: /weekly/i }));
    expect(screen.getByText(/88\.00/)).toBeInTheDocument();
  });

  it("toggles to monthly view", () => {
    const { container } = render(<Dashboard dailyTotals={mockDailyTotals} />);
    fireEvent.click(screen.getByRole("button", { name: /monthly/i }));
    const summaryValues = container.querySelectorAll(".totals-summary .total-value");
    expect(summaryValues[0]).toHaveTextContent("88.00");
    expect(summaryValues[1]).toHaveTextContent("175");
  });

  it("handles empty data gracefully", () => {
    render(<Dashboard dailyTotals={{}} />);
    expect(screen.getByText(/0\.00/)).toBeInTheDocument();
  });
});
