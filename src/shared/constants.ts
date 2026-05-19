import type { Grade } from "./types";

export interface GradeThreshold {
  grade: Grade;
  maxCo2: number;
}

export const GRADE_THRESHOLDS: GradeThreshold[] = [
  { grade: "A+", maxCo2: 0.095 },
  { grade: "A", maxCo2: 0.185 },
  { grade: "B", maxCo2: 0.341 },
  { grade: "C", maxCo2: 0.493 },
  { grade: "D", maxCo2: 0.656 },
  { grade: "F", maxCo2: Infinity },
];

export const BADGE_COLOURS: Record<Grade, string> = {
  "A+": "#27AE60",
  A: "#27AE60",
  B: "#F39C12",
  C: "#F39C12",
  D: "#E74C3C",
  F: "#E74C3C",
};

export const ENERGY_PER_GB_KWH = 0.81;
export const RETURNING_VISITOR_FACTOR = 0.75;
export const GLOBAL_AVERAGE_INTENSITY = 442;

export const COMPARISON_FACTORS = {
  km_per_gram_co2: 1 / 121,
  flights_per_gram_co2: 1 / 255_000,
  beef_meals_per_gram_co2: 1 / 3_300,
} as const;
