import { describe, it, expect } from "vitest";
import { calculateCarbon, type CarbonResult } from "@background/carbon-calculator";
import {
  ENERGY_PER_GB_KWH,
  GLOBAL_AVERAGE_INTENSITY,
  RETURNING_VISITOR_FACTOR,
} from "@shared/constants";

// Helper: 2MB in bytes
const TWO_MB = 2 * 1024 * 1024;
const TWO_MB_GB = TWO_MB / 1_073_741_824;

describe("carbon calculation engine", () => {
  // T-014: Calculates CO2 correctly for a first-time visit
  it("calculates CO2 correctly for a first-time visit (T-014)", () => {
    const result = calculateCarbon({
      transferSizeBytes: TWO_MB,
      carbonIntensity: GLOBAL_AVERAGE_INTENSITY,
      isGreenHost: false,
      isReturningVisitor: false,
    });

    // Formula: (data_gb * 0.81 * 1.0 * 442) + (data_gb * 0.52 * 0.25 * 442)
    const expected =
      TWO_MB_GB * ENERGY_PER_GB_KWH * 1.0 * GLOBAL_AVERAGE_INTENSITY +
      TWO_MB_GB * 0.52 * 0.25 * GLOBAL_AVERAGE_INTENSITY;

    expect(result.co2_grams).toBeCloseTo(expected, 6);
  });

  // T-015: Applies returning visitor adjustment
  it("applies returning visitor adjustment of 0.75x (T-015)", () => {
    const firstVisit = calculateCarbon({
      transferSizeBytes: TWO_MB,
      carbonIntensity: GLOBAL_AVERAGE_INTENSITY,
      isGreenHost: false,
      isReturningVisitor: false,
    });

    const returnVisit = calculateCarbon({
      transferSizeBytes: TWO_MB,
      carbonIntensity: GLOBAL_AVERAGE_INTENSITY,
      isGreenHost: false,
      isReturningVisitor: true,
    });

    // The network component should be 0.75x, but end-user component stays the same
    expect(returnVisit.co2_grams).toBeLessThan(firstVisit.co2_grams);

    // Verify the network component uses 0.75 factor
    const networkFirst =
      TWO_MB_GB * ENERGY_PER_GB_KWH * 1.0 * GLOBAL_AVERAGE_INTENSITY;
    const networkReturn =
      TWO_MB_GB *
      ENERGY_PER_GB_KWH *
      RETURNING_VISITOR_FACTOR *
      GLOBAL_AVERAGE_INTENSITY;
    const endUser = TWO_MB_GB * 0.52 * 0.25 * GLOBAL_AVERAGE_INTENSITY;

    expect(firstVisit.co2_grams).toBeCloseTo(networkFirst + endUser, 6);
    expect(returnVisit.co2_grams).toBeCloseTo(networkReturn + endUser, 6);
  });

  // T-016: Applies green hosting multiplier
  it("zeroes data centre energy for green-hosted pages (T-016)", () => {
    const conventional = calculateCarbon({
      transferSizeBytes: TWO_MB,
      carbonIntensity: GLOBAL_AVERAGE_INTENSITY,
      isGreenHost: false,
      isReturningVisitor: false,
    });

    const green = calculateCarbon({
      transferSizeBytes: TWO_MB,
      carbonIntensity: GLOBAL_AVERAGE_INTENSITY,
      isGreenHost: true,
      isReturningVisitor: false,
    });

    expect(green.co2_grams).toBeLessThan(conventional.co2_grams);
    // Green hosting should only have the end-user component
    const endUser = TWO_MB_GB * 0.52 * 0.25 * GLOBAL_AVERAGE_INTENSITY;
    expect(green.co2_grams).toBeCloseTo(endUser, 6);
  });

  // T-017: Handles zero transfer size
  it("returns 0 grams CO2 for zero transfer size (T-017)", () => {
    const result = calculateCarbon({
      transferSizeBytes: 0,
      carbonIntensity: GLOBAL_AVERAGE_INTENSITY,
      isGreenHost: false,
      isReturningVisitor: false,
    });

    expect(result.co2_grams).toBe(0);
    expect(result.energy_kwh).toBe(0);
  });

  // T-018: Calculates correctly for low-carbon grids
  it("produces significantly lower CO2 for low-carbon grids like Norway (T-018)", () => {
    const norway = calculateCarbon({
      transferSizeBytes: TWO_MB,
      carbonIntensity: 30, // Norway ~30 gCO2/kWh
      isGreenHost: false,
      isReturningVisitor: false,
    });

    const global = calculateCarbon({
      transferSizeBytes: TWO_MB,
      carbonIntensity: GLOBAL_AVERAGE_INTENSITY,
      isGreenHost: false,
      isReturningVisitor: false,
    });

    expect(norway.co2_grams).toBeLessThan(global.co2_grams);
    // Norway should be roughly 30/442 of the network component
    expect(norway.co2_grams).toBeLessThan(global.co2_grams * 0.2);
  });

  // T-019: Calculates correctly for high-carbon grids
  it("produces significantly higher CO2 for high-carbon grids like Poland (T-019)", () => {
    const poland = calculateCarbon({
      transferSizeBytes: TWO_MB,
      carbonIntensity: 700, // Poland ~700 gCO2/kWh
      isGreenHost: false,
      isReturningVisitor: false,
    });

    const global = calculateCarbon({
      transferSizeBytes: TWO_MB,
      carbonIntensity: GLOBAL_AVERAGE_INTENSITY,
      isGreenHost: false,
      isReturningVisitor: false,
    });

    expect(poland.co2_grams).toBeGreaterThan(global.co2_grams);
  });

  // Additional: output includes required fields
  it("output includes co2_grams, energy_kwh, and transfer_kb", () => {
    const result = calculateCarbon({
      transferSizeBytes: TWO_MB,
      carbonIntensity: GLOBAL_AVERAGE_INTENSITY,
      isGreenHost: false,
      isReturningVisitor: false,
    });

    expect(result).toHaveProperty("co2_grams");
    expect(result).toHaveProperty("energy_kwh");
    expect(result).toHaveProperty("transfer_kb");
    expect(result.transfer_kb).toBeCloseTo(TWO_MB / 1024, 0);
    expect(result.energy_kwh).toBeGreaterThan(0);
  });
});
