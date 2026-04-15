// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import ResourceBreakdown from "@popup/components/ResourceBreakdown";
import type { ResourceCategory } from "@content/collect";

interface CategorySummary {
  category: ResourceCategory;
  totalKb: number;
}

const defaultCategories: CategorySummary[] = [
  { category: "image", totalKb: 800 },
  { category: "script", totalKb: 400 },
  { category: "css", totalKb: 50 },
  { category: "font", totalKb: 120 },
  { category: "other", totalKb: 30 },
];

describe("ResourceBreakdown component", () => {
  // T-034: Popup shows resource breakdown
  it("shows all resource categories with sizes in KB (T-034)", () => {
    render(<ResourceBreakdown categories={defaultCategories} />);

    expect(screen.getByText(/image/i)).toBeInTheDocument();
    expect(screen.getByText(/800/)).toBeInTheDocument();
    expect(screen.getByText(/script/i)).toBeInTheDocument();
    expect(screen.getByText(/400/)).toBeInTheDocument();
    expect(screen.getByText(/css/i)).toBeInTheDocument();
    expect(screen.getByText(/50/)).toBeInTheDocument();
    expect(screen.getByText(/font/i)).toBeInTheDocument();
    expect(screen.getByText(/120/)).toBeInTheDocument();
    expect(screen.getByText(/other/i)).toBeInTheDocument();
    expect(screen.getByText(/30/)).toBeInTheDocument();
  });

  it("sorts categories by size descending (heaviest first)", () => {
    const { container } = render(
      <ResourceBreakdown categories={defaultCategories} />
    );

    const rows = container.querySelectorAll("[data-category]");
    const categories = Array.from(rows).map((r) =>
      r.getAttribute("data-category")
    );

    expect(categories).toEqual(["image", "script", "font", "css", "other"]);
  });

  it("renders visual bars with proportional widths", () => {
    const { container } = render(
      <ResourceBreakdown categories={defaultCategories} />
    );

    const bars = container.querySelectorAll(".breakdown-bar");
    expect(bars.length).toBe(5);

    // First bar (image, 800KB) should be widest
    const firstBar = bars[0] as HTMLElement;
    expect(firstBar.style.width).toBe("100%");
  });

  it("handles empty categories", () => {
    const { container } = render(<ResourceBreakdown categories={[]} />);
    expect(container.querySelector("[data-category]")).toBeNull();
  });

  it("handles single category", () => {
    render(
      <ResourceBreakdown
        categories={[{ category: "script", totalKb: 250 }]}
      />
    );
    expect(screen.getByText(/script/i)).toBeInTheDocument();
    expect(screen.getByText(/250/)).toBeInTheDocument();
  });

  it("displays categories: images, scripts, fonts, CSS, other", () => {
    render(<ResourceBreakdown categories={defaultCategories} />);

    // All five expected categories are present
    const { container } = render(
      <ResourceBreakdown categories={defaultCategories} />
    );
    const categoryAttrs = Array.from(
      container.querySelectorAll("[data-category]")
    ).map((el) => el.getAttribute("data-category"));

    expect(categoryAttrs).toContain("image");
    expect(categoryAttrs).toContain("script");
    expect(categoryAttrs).toContain("css");
    expect(categoryAttrs).toContain("font");
    expect(categoryAttrs).toContain("other");
  });
});
