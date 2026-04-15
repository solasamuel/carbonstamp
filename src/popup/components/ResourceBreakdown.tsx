import React from "react";
import type { ResourceCategory } from "@content/collect";

interface CategorySummary {
  category: ResourceCategory;
  totalKb: number;
}

interface ResourceBreakdownProps {
  categories: CategorySummary[];
}

const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  image: "Images",
  script: "Scripts",
  css: "CSS",
  font: "Fonts",
  other: "Other",
};

export default function ResourceBreakdown({
  categories,
}: ResourceBreakdownProps) {
  const sorted = [...categories].sort((a, b) => b.totalKb - a.totalKb);
  const maxKb = sorted.length > 0 ? sorted[0].totalKb : 0;

  return (
    <div className="resource-breakdown">
      {sorted.map(({ category, totalKb }) => (
        <div key={category} className="breakdown-row" data-category={category}>
          <span className="breakdown-label">
            {CATEGORY_LABELS[category]}
          </span>
          <div className="breakdown-bar-container">
            <div
              className="breakdown-bar"
              style={{
                width: maxKb > 0 ? `${(totalKb / maxKb) * 100}%` : "0%",
              }}
            />
          </div>
          <span className="breakdown-size">{Math.round(totalKb)} KB</span>
        </div>
      ))}
    </div>
  );
}
