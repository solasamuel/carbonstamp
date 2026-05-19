import { describe, it, expect } from "vitest";
import {
  GRADE_THRESHOLDS,
  BADGE_COLOURS,
  COMPARISON_FACTORS,
  ENERGY_PER_GB_KWH,
  RETURNING_VISITOR_FACTOR,
  GLOBAL_AVERAGE_INTENSITY,
} from "@shared/constants";

describe("grade thresholds", () => {
  it("defines all grades from A+ to F", () => {
    const grades = GRADE_THRESHOLDS.map((t) => t.grade);
    expect(grades).toEqual(["A+", "A", "B", "C", "D", "F"]);
  });

  it("thresholds are in ascending order", () => {
    for (let i = 1; i < GRADE_THRESHOLDS.length; i++) {
      expect(GRADE_THRESHOLDS[i].maxCo2).toBeGreaterThan(
        GRADE_THRESHOLDS[i - 1].maxCo2
      );
    }
  });

  it("F grade has Infinity as max threshold", () => {
    const fGrade = GRADE_THRESHOLDS.find((t) => t.grade === "F");
    expect(fGrade?.maxCo2).toBe(Infinity);
  });
});

describe("badge colours", () => {
  it("maps A+ and A to green", () => {
    expect(BADGE_COLOURS["A+"]).toBe("#27AE60");
    expect(BADGE_COLOURS["A"]).toBe("#27AE60");
  });

  it("maps B and C to amber", () => {
    expect(BADGE_COLOURS["B"]).toBe("#F39C12");
    expect(BADGE_COLOURS["C"]).toBe("#F39C12");
  });

  it("maps D and F to red", () => {
    expect(BADGE_COLOURS["D"]).toBe("#E74C3C");
    expect(BADGE_COLOURS["F"]).toBe("#E74C3C");
  });

  it("covers all six grades", () => {
    const grades = Object.keys(BADGE_COLOURS);
    expect(grades).toEqual(expect.arrayContaining(["A+", "A", "B", "C", "D", "F"]));
    expect(grades).toHaveLength(6);
  });
});

describe("comparison factors", () => {
  it("defines km_per_gram_co2", () => {
    expect(COMPARISON_FACTORS.km_per_gram_co2).toBeCloseTo(1 / 121, 5);
  });

  it("defines flights_per_gram_co2", () => {
    expect(COMPARISON_FACTORS.flights_per_gram_co2).toBeCloseTo(1 / 255000, 10);
  });

  it("defines beef_meals_per_gram_co2", () => {
    expect(COMPARISON_FACTORS.beef_meals_per_gram_co2).toBeCloseTo(1 / 3300, 7);
  });
});

describe("energy and carbon constants", () => {
  it("energy per GB is 0.81 kWh", () => {
    expect(ENERGY_PER_GB_KWH).toBe(0.81);
  });

  it("returning visitor factor is 0.75", () => {
    expect(RETURNING_VISITOR_FACTOR).toBe(0.75);
  });

  it("global average carbon intensity is 442 gCO2/kWh", () => {
    expect(GLOBAL_AVERAGE_INTENSITY).toBe(442);
  });
});
