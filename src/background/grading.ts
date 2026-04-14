import { GRADE_THRESHOLDS } from "@shared/constants";
import type { Grade } from "@shared/types";

export function assignGrade(co2Grams: number): Grade {
  for (const threshold of GRADE_THRESHOLDS) {
    if (co2Grams < threshold.maxCo2) {
      return threshold.grade;
    }
  }
  return "F";
}

export interface PercentileResult {
  percentage: number;
  totalPages: number;
  text: string;
}

export function calculatePercentile(
  co2Grams: number,
  historicalValues: number[]
): PercentileResult {
  const totalPages = historicalValues.length + 1;
  const heavierThan = historicalValues.filter((v) => co2Grams > v).length;
  const percentage = historicalValues.length === 0
    ? 0
    : Math.round((heavierThan / historicalValues.length) * 100);

  return {
    percentage,
    totalPages,
    text: `heavier than ${percentage}% of ${totalPages} pages analysed`,
  };
}
