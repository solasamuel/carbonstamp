import { useState, useEffect } from "react";
import type { PageResult, DailyTotal, Grade } from "@shared/types";

export interface CurrentPageData {
  domain: string;
  result: PageResult;
}

export interface SiteSummary {
  domain: string;
  avgCo2Grams: number;
}

export interface StorageData {
  currentPage: CurrentPageData | null;
  dailyTotals: Record<string, DailyTotal>;
  topSites: SiteSummary[];
  gradeDistribution: Record<Grade, number>;
  totalCo2Grams: number;
  totalPages: number;
  daysOfData: number;
  loading: boolean;
}

export function useStorageData(): StorageData {
  const [data, setData] = useState<StorageData>({
    currentPage: null,
    dailyTotals: {},
    topSites: [],
    gradeDistribution: { "A+": 0, A: 0, B: 0, C: 0, D: 0, F: 0 },
    totalCo2Grams: 0,
    totalPages: 0,
    daysOfData: 0,
    loading: true,
  });

  useEffect(() => {
    loadData().then(setData);
  }, []);

  return data;
}

async function loadData(): Promise<StorageData> {
  const allData = await chrome.storage.local.get(null);

  const dailyTotals: Record<string, DailyTotal> = {};
  const siteMap = new Map<string, { totalCo2: number; visits: number }>();
  const gradeDistribution: Record<Grade, number> = {
    "A+": 0,
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    F: 0,
  };

  let totalCo2Grams = 0;
  let totalPages = 0;

  for (const [key, value] of Object.entries(allData)) {
    if (key.startsWith("totals:")) {
      const date = key.slice(7);
      const total = value as DailyTotal;
      dailyTotals[date] = total;
      totalCo2Grams += total.total_co2_grams;
      totalPages += total.page_count;
    }

    if (key.startsWith("page:")) {
      const result = value as PageResult;
      const parts = key.split(":");
      const domain = parts[1];

      gradeDistribution[result.grade] =
        (gradeDistribution[result.grade] ?? 0) + result.visits;

      const existing = siteMap.get(domain);
      if (existing) {
        existing.totalCo2 += result.co2_grams * result.visits;
        existing.visits += result.visits;
      } else {
        siteMap.set(domain, {
          totalCo2: result.co2_grams * result.visits,
          visits: result.visits,
        });
      }
    }
  }

  const topSites: SiteSummary[] = Array.from(siteMap.entries())
    .map(([domain, { totalCo2, visits }]) => ({
      domain,
      avgCo2Grams: totalCo2 / visits,
    }))
    .sort((a, b) => b.avgCo2Grams - a.avgCo2Grams)
    .slice(0, 10);

  // Get current tab's data
  let currentPage: CurrentPageData | null = null;
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.url) {
      const domain = new URL(tab.url).hostname;
      const today = new Date().toISOString().slice(0, 10);
      const pageKey = `page:${domain}:${today}`;
      if (allData[pageKey]) {
        currentPage = {
          domain,
          result: allData[pageKey] as PageResult,
        };
      }
    }
  } catch {
    // tabs API may not be available in tests
  }

  const daysOfData = Object.keys(dailyTotals).length;

  return {
    currentPage,
    dailyTotals,
    topSites,
    gradeDistribution,
    totalCo2Grams,
    totalPages,
    daysOfData,
    loading: false,
  };
}
