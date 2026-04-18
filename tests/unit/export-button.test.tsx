// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import ExportButton, { generateSummaryText } from "@popup/components/ExportButton";

describe("generateSummaryText", () => {
  const data = {
    totalCo2Grams: 88,
    pageCount: 175,
    daysOfData: 7,
    topSites: [
      { domain: "heavy.com", avgCo2Grams: 1.5 },
      { domain: "medium.com", avgCo2Grams: 0.5 },
    ],
    gradeDistribution: { "A+": 10, A: 20, B: 50, C: 40, D: 30, F: 25 },
  };

  it("includes total CO2", () => {
    const text = generateSummaryText(data);
    expect(text).toContain("88");
  });

  it("includes page count", () => {
    const text = generateSummaryText(data);
    expect(text).toContain("175");
  });

  it("includes top sites", () => {
    const text = generateSummaryText(data);
    expect(text).toContain("heavy.com");
    expect(text).toContain("medium.com");
  });

  it("includes grade distribution", () => {
    const text = generateSummaryText(data);
    expect(text).toContain("A+");
    expect(text).toContain("F");
  });

  it("includes CarbonStamp branding", () => {
    const text = generateSummaryText(data);
    expect(text).toContain("CarbonStamp");
  });
});

describe("ExportButton component", () => {
  const defaultProps = {
    totalCo2Grams: 88,
    pageCount: 175,
    daysOfData: 7,
    topSites: [{ domain: "heavy.com", avgCo2Grams: 1.5 }],
    gradeDistribution: { "A+": 5, A: 10, B: 20, C: 15, D: 10, F: 5 },
  };

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
    });
  });

  // T-039: Export generates shareable summary
  it("renders an export button (T-039)", () => {
    render(<ExportButton {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /export/i })
    ).toBeInTheDocument();
  });

  it("copies summary to clipboard on click (T-039)", async () => {
    render(<ExportButton {...defaultProps} />);
    const button = screen.getByRole("button", { name: /export/i });
    fireEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledOnce();
    const clipboardText = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;
    expect(clipboardText).toContain("CarbonStamp");
    expect(clipboardText).toContain("88");
  });

  it("shows confirmation after copy", async () => {
    render(<ExportButton {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /export/i }));
    expect(screen.getByText(/copied/i)).toBeInTheDocument();
  });
});
