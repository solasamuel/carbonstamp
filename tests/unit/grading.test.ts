import { describe, it, expect } from "vitest";
import { assignGrade, calculatePercentile } from "@background/grading";
import { GRADE_THRESHOLDS } from "@shared/constants";
import type { Grade } from "@shared/types";

describe("grade assignment", () => {
  // T-020: Assigns A+ grade for very low carbon pages
  it("assigns A+ for CO2 under 0.095g (T-020)", () => {
    expect(assignGrade(0.05)).toBe("A+");
    expect(assignGrade(0.0)).toBe("A+");
    expect(assignGrade(0.094)).toBe("A+");
  });

  // T-021: Assigns F grade for very high carbon pages
  it("assigns F for CO2 at or above 0.656g (T-021)", () => {
    expect(assignGrade(0.656)).toBe("F");
    expect(assignGrade(1.0)).toBe("F");
    expect(assignGrade(10.0)).toBe("F");
  });

  // T-023: Grade boundaries are contiguous with no gaps
  it("grade boundaries are contiguous with no gaps (T-023)", () => {
    // Test at each boundary
    const boundaryTests: [number, Grade][] = [
      [0.0, "A+"],
      [0.094, "A+"],
      [0.095, "A"],
      [0.184, "A"],
      [0.185, "B"],
      [0.340, "B"],
      [0.341, "C"],
      [0.492, "C"],
      [0.493, "D"],
      [0.655, "D"],
      [0.656, "F"],
    ];

    for (const [co2, expected] of boundaryTests) {
      expect(assignGrade(co2), `CO2=${co2} should be ${expected}`).toBe(
        expected
      );
    }
  });

  it("assigns exactly one grade for any non-negative CO2 value", () => {
    const testValues = [0, 0.001, 0.05, 0.1, 0.2, 0.35, 0.5, 0.65, 0.7, 1, 5, 100];
    for (const co2 of testValues) {
      const grade = assignGrade(co2);
      const validGrades: Grade[] = ["A+", "A", "B", "C", "D", "F"];
      expect(validGrades).toContain(grade);
    }
  });

  it("covers all grades defined in GRADE_THRESHOLDS", () => {
    const allGrades = new Set<Grade>();
    // Use values that should hit each grade
    const testValues = [0.01, 0.1, 0.25, 0.4, 0.6, 1.0];
    for (const v of testValues) {
      allGrades.add(assignGrade(v));
    }
    expect(allGrades.size).toBe(GRADE_THRESHOLDS.length);
  });
});

describe("percentile calculation", () => {
  // T-022: Calculates correct percentile ranking
  it("calculates correct percentile ranking (T-022)", () => {
    // 100 pages with CO2 values from 0.01 to 1.0
    const historicalValues = Array.from({ length: 100 }, (_, i) =>
      ((i + 1) / 100)
    );

    // A page with 0.5g CO2 is heavier than 49 of 100 values (0.01..0.49)
    const result = calculatePercentile(0.5, historicalValues);

    expect(result.percentage).toBe(49);
    expect(result.totalPages).toBe(101); // 100 historical + this one
    expect(result.text).toMatch(/heavier than \d+% of 101 pages analysed/);
  });

  it("returns 0% for the lightest page", () => {
    const historicalValues = [0.5, 0.6, 0.7, 0.8];
    const result = calculatePercentile(0.01, historicalValues);
    expect(result.percentage).toBe(0);
  });

  it("returns near 100% for the heaviest page", () => {
    const historicalValues = [0.01, 0.02, 0.03, 0.04];
    const result = calculatePercentile(10.0, historicalValues);
    expect(result.percentage).toBe(100);
  });

  it("handles empty history", () => {
    const result = calculatePercentile(0.5, []);
    expect(result.percentage).toBe(0);
    expect(result.totalPages).toBe(1);
    expect(result.text).toMatch(/heavier than 0% of 1 pages analysed/);
  });
});
