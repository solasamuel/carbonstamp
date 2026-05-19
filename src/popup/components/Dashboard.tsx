import React, { useState, useMemo } from "react";
import type { DailyTotal } from "@shared/types";

type Period = "daily" | "weekly" | "monthly";

interface AggregatedTotal {
  label: string;
  total_co2_grams: number;
  page_count: number;
}

function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(
    ((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7
  );
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // YYYY-MM
}

export function aggregateTotals(
  dailyTotals: Record<string, DailyTotal>,
  period: Period
): AggregatedTotal[] {
  const entries = Object.entries(dailyTotals).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  if (period === "daily") {
    return entries.map(([date, total]) => ({
      label: date,
      ...total,
    }));
  }

  const grouped = new Map<string, AggregatedTotal>();
  const keyFn = period === "weekly" ? getWeekKey : getMonthKey;

  for (const [date, total] of entries) {
    const key = keyFn(date);
    const existing = grouped.get(key);
    if (existing) {
      existing.total_co2_grams += total.total_co2_grams;
      existing.page_count += total.page_count;
    } else {
      grouped.set(key, {
        label: key,
        total_co2_grams: total.total_co2_grams,
        page_count: total.page_count,
      });
    }
  }

  return Array.from(grouped.values());
}

interface DashboardProps {
  dailyTotals: Record<string, DailyTotal>;
}

export default function Dashboard({ dailyTotals }: DashboardProps) {
  const [period, setPeriod] = useState<Period>("daily");

  const aggregated = useMemo(
    () => aggregateTotals(dailyTotals, period),
    [dailyTotals, period]
  );

  const totalCo2 = aggregated.reduce((s, a) => s + a.total_co2_grams, 0);
  const totalPages = aggregated.reduce((s, a) => s + a.page_count, 0);

  return (
    <div className="dashboard">
      <div className="period-toggle">
        {(["daily", "weekly", "monthly"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={period === p ? "active" : ""}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <div className="totals-summary">
        <div className="total-stat">
          <span className="total-value">{totalCo2.toFixed(2)}</span>
          <span className="total-label">gCO₂</span>
        </div>
        <div className="total-stat">
          <span className="total-value">{totalPages}</span>
          <span className="total-label">pages</span>
        </div>
      </div>

      <div className="totals-list">
        {aggregated.map((row) => (
          <div key={row.label} className="totals-row">
            <span className="row-label">{row.label}</span>
            <span className="row-co2">{row.total_co2_grams.toFixed(2)} gCO₂</span>
            <span className="row-pages">{row.page_count} pages</span>
          </div>
        ))}
      </div>
    </div>
  );
}
