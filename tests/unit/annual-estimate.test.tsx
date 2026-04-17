// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import AnnualEstimate, {
  estimateAnnual,
} from "@popup/components/AnnualEstimate";
import { COMPARISON_FACTORS } from "@shared/constants";

describe("estimateAnnual", () => {
  it("extrapolates 7 days of data to annual estimate", () => {
    // 7 days with total 88g CO2
    const result = estimateAnnual(88, 7);
    const expectedAnnual = (88 / 7) * 365;
    expect(result.annualCo2Grams).toBeCloseTo(expectedAnnual, 0);
  });

  it("calculates km driven comparison", () => {
    const result = estimateAnnual(88, 7);
    const expectedKm = result.annualCo2Grams * COMPARISON_FACTORS.km_per_gram_co2;
    expect(result.kmDriven).toBeCloseTo(expectedKm, 2);
  });

  it("calculates flights comparison", () => {
    const result = estimateAnnual(88, 7);
    const expectedFlights =
      result.annualCo2Grams * COMPARISON_FACTORS.flights_per_gram_co2;
    expect(result.flights).toBeCloseTo(expectedFlights, 5);
  });

  it("calculates beef meals comparison", () => {
    const result = estimateAnnual(88, 7);
    const expectedMeals =
      result.annualCo2Grams * COMPARISON_FACTORS.beef_meals_per_gram_co2;
    expect(result.beefMeals).toBeCloseTo(expectedMeals, 4);
  });

  it("handles zero days gracefully", () => {
    const result = estimateAnnual(0, 0);
    expect(result.annualCo2Grams).toBe(0);
    expect(result.kmDriven).toBe(0);
    expect(result.flights).toBe(0);
    expect(result.beefMeals).toBe(0);
  });

  it("handles single day of data", () => {
    const result = estimateAnnual(10, 1);
    expect(result.annualCo2Grams).toBeCloseTo(3650, 0);
  });
});

describe("AnnualEstimate component", () => {
  // T-038: Annual estimate displays with real-world comparisons
  it("shows estimated annual CO2 (T-038)", () => {
    render(<AnnualEstimate totalCo2Grams={88} daysOfData={7} />);
    // 88/7 * 365 = ~4588.57, rounded to 4,589
    expect(screen.getByText(/4,?589/)).toBeInTheDocument();
  });

  it("shows km driven comparison (T-038)", () => {
    render(<AnnualEstimate totalCo2Grams={88} daysOfData={7} />);
    expect(screen.getByText(/km driven/i)).toBeInTheDocument();
  });

  it("shows flights comparison (T-038)", () => {
    render(<AnnualEstimate totalCo2Grams={88} daysOfData={7} />);
    expect(screen.getByText(/flight/i)).toBeInTheDocument();
  });

  it("shows beef meals comparison (T-038)", () => {
    render(<AnnualEstimate totalCo2Grams={88} daysOfData={7} />);
    expect(screen.getByText(/beef/i)).toBeInTheDocument();
  });

  it("handles zero data gracefully", () => {
    const { container } = render(<AnnualEstimate totalCo2Grams={0} daysOfData={0} />);
    const annualValue = container.querySelector(".annual-value");
    expect(annualValue).toHaveTextContent("0");
  });
});
