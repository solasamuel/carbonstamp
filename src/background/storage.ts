import type { PageResult, DailyTotal } from "@shared/types";

function pageKey(domain: string, date: string): string {
  return `page:${domain}:${date}`;
}

function totalsKey(date: string): string {
  return `totals:${date}`;
}

export async function storePageResult(
  domain: string,
  date: string,
  result: PageResult
): Promise<void> {
  const pKey = pageKey(domain, date);
  const tKey = totalsKey(date);

  // Get existing page entry and totals
  const existing = await chrome.storage.local.get([pKey, tKey]);
  const existingPage = existing[pKey] as PageResult | undefined;
  const existingTotals = existing[tKey] as DailyTotal | undefined;

  // Merge page result (increment visits if exists)
  const mergedPage: PageResult = existingPage
    ? {
        ...result,
        visits: existingPage.visits + 1,
      }
    : result;

  // Update daily totals
  const mergedTotals: DailyTotal = {
    total_co2_grams: (existingTotals?.total_co2_grams ?? 0) + result.co2_grams,
    page_count: (existingTotals?.page_count ?? 0) + 1,
  };

  await chrome.storage.local.set({
    [pKey]: mergedPage,
    [tKey]: mergedTotals,
  });
}

export async function getDailyTotal(date: string): Promise<DailyTotal> {
  const key = totalsKey(date);
  const result = await chrome.storage.local.get([key]);
  return (result[key] as DailyTotal) ?? { total_co2_grams: 0, page_count: 0 };
}
