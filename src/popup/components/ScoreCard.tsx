import React from "react";
import type { Grade } from "@shared/types";
import { BADGE_COLOURS } from "@shared/constants";

interface ScoreCardProps {
  grade: Grade;
  co2Grams: number;
  transferKb: number;
  energyKwh: number;
  greenHost: boolean;
  percentileText: string;
}

function formatTransferSize(kb: number): string {
  if (kb >= 1024) {
    return `${(kb / 1024).toFixed(2)} MB`;
  }
  return `${Math.round(kb)} KB`;
}

export default function ScoreCard({
  grade,
  co2Grams,
  transferKb,
  energyKwh,
  greenHost,
  percentileText,
}: ScoreCardProps) {
  const badgeColour = BADGE_COLOURS[grade];

  return (
    <div className="score-card">
      <div
        className="grade-badge"
        data-grade={grade}
        style={{ backgroundColor: badgeColour, color: "#fff" }}
      >
        {grade}
      </div>

      <div className="score-details">
        <div className="stat">
          <span className="stat-value">{co2Grams.toFixed(2)}</span>
          <span className="stat-label">gCO₂</span>
        </div>

        <div className="stat">
          <span className="stat-value">{formatTransferSize(transferKb)}</span>
          <span className="stat-label">transferred</span>
        </div>

        <div className="stat">
          <span className="stat-value">{energyKwh.toFixed(4)}</span>
          <span className="stat-label">kWh</span>
        </div>

        <div className="stat">
          <span className="stat-value">
            {greenHost ? "Green host" : "Conventional"}
          </span>
          <span className="stat-label">hosting</span>
        </div>
      </div>

      <p className="percentile">{percentileText}</p>
    </div>
  );
}
