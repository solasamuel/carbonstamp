import React from "react";
import { COMPARISON_FACTORS } from "@shared/constants";

export interface AnnualEstimateResult {
  annualCo2Grams: number;
  kmDriven: number;
  flights: number;
  beefMeals: number;
}

export function estimateAnnual(
  totalCo2Grams: number,
  daysOfData: number
): AnnualEstimateResult {
  if (daysOfData === 0) {
    return { annualCo2Grams: 0, kmDriven: 0, flights: 0, beefMeals: 0 };
  }

  const dailyAvg = totalCo2Grams / daysOfData;
  const annualCo2Grams = dailyAvg * 365;

  return {
    annualCo2Grams,
    kmDriven: annualCo2Grams * COMPARISON_FACTORS.km_per_gram_co2,
    flights: annualCo2Grams * COMPARISON_FACTORS.flights_per_gram_co2,
    beefMeals: annualCo2Grams * COMPARISON_FACTORS.beef_meals_per_gram_co2,
  };
}

function formatNumber(n: number, decimals = 1): string {
  if (n >= 1000) {
    return n.toLocaleString("en-GB", {
      maximumFractionDigits: decimals,
    });
  }
  return n.toFixed(decimals);
}

interface AnnualEstimateProps {
  totalCo2Grams: number;
  daysOfData: number;
}

export default function AnnualEstimate({
  totalCo2Grams,
  daysOfData,
}: AnnualEstimateProps) {
  const estimate = estimateAnnual(totalCo2Grams, daysOfData);

  return (
    <div className="annual-estimate">
      <h3>Estimated annual footprint</h3>
      <div className="annual-co2">
        <span className="annual-value">
          {formatNumber(estimate.annualCo2Grams, 0)}
        </span>
        <span className="annual-unit">gCO₂/year</span>
      </div>

      <div className="comparisons">
        <div className="comparison">
          <span className="comparison-value">
            {formatNumber(estimate.kmDriven)}
          </span>
          <span className="comparison-label">km driven</span>
        </div>
        <div className="comparison">
          <span className="comparison-value">
            {formatNumber(estimate.flights, 3)}
          </span>
          <span className="comparison-label">short-haul flights</span>
        </div>
        <div className="comparison">
          <span className="comparison-value">
            {formatNumber(estimate.beefMeals, 2)}
          </span>
          <span className="comparison-label">meals of beef</span>
        </div>
      </div>
    </div>
  );
}
