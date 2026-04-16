// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import TopSitesChart, {
  type SiteSummary,
  getTopSites,
} from "@popup/components/TopSitesChart";

const mockSites: SiteSummary[] = [
  { domain: "heavy1.com", avgCo2Grams: 1.5 },
  { domain: "heavy2.com", avgCo2Grams: 1.2 },
  { domain: "heavy3.com", avgCo2Grams: 0.9 },
  { domain: "heavy4.com", avgCo2Grams: 0.8 },
  { domain: "heavy5.com", avgCo2Grams: 0.7 },
  { domain: "heavy6.com", avgCo2Grams: 0.6 },
  { domain: "heavy7.com", avgCo2Grams: 0.5 },
  { domain: "heavy8.com", avgCo2Grams: 0.4 },
  { domain: "heavy9.com", avgCo2Grams: 0.3 },
  { domain: "heavy10.com", avgCo2Grams: 0.2 },
  { domain: "light1.com", avgCo2Grams: 0.1 },
  { domain: "light2.com", avgCo2Grams: 0.05 },
  { domain: "light3.com", avgCo2Grams: 0.02 },
  { domain: "light4.com", avgCo2Grams: 0.01 },
  { domain: "light5.com", avgCo2Grams: 0.005 },
];

describe("getTopSites", () => {
  it("returns top 10 sites ranked by average CO2 per visit", () => {
    const top = getTopSites(mockSites, 10);
    expect(top).toHaveLength(10);
    expect(top[0].domain).toBe("heavy1.com");
    expect(top[9].domain).toBe("heavy10.com");
  });

  it("returns all sites when fewer than 10", () => {
    const few = mockSites.slice(0, 3);
    const top = getTopSites(few, 10);
    expect(top).toHaveLength(3);
  });

  it("sorts descending by avgCo2Grams", () => {
    const top = getTopSites(mockSites, 10);
    for (let i = 1; i < top.length; i++) {
      expect(top[i].avgCo2Grams).toBeLessThanOrEqual(top[i - 1].avgCo2Grams);
    }
  });
});

describe("TopSitesChart component", () => {
  // T-036: Top 10 chart renders with D3.js
  it("renders an SVG element (T-036)", () => {
    const { container } = render(<TopSitesChart sites={mockSites} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders 10 bars for 15 sites (T-036)", () => {
    const { container } = render(<TopSitesChart sites={mockSites} />);
    const bars = container.querySelectorAll("rect.bar");
    expect(bars).toHaveLength(10);
  });

  it("labels each bar with domain name (T-036)", () => {
    render(<TopSitesChart sites={mockSites} />);
    expect(screen.getByText("heavy1.com")).toBeInTheDocument();
    expect(screen.getByText("heavy10.com")).toBeInTheDocument();
  });

  it("labels each bar with average grams CO2 (T-036)", () => {
    render(<TopSitesChart sites={mockSites} />);
    expect(screen.getByText(/1\.50/)).toBeInTheDocument(); // heavy1.com
  });

  // T-037: Top 10 chart handles fewer than 10 domains
  it("renders 3 bars for 3 sites without error (T-037)", () => {
    const few = mockSites.slice(0, 3);
    const { container } = render(<TopSitesChart sites={few} />);
    const bars = container.querySelectorAll("rect.bar");
    expect(bars).toHaveLength(3);
  });

  it("renders empty state for no sites", () => {
    const { container } = render(<TopSitesChart sites={[]} />);
    const bars = container.querySelectorAll("rect.bar");
    expect(bars).toHaveLength(0);
  });
});
