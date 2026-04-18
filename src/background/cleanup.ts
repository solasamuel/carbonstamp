const RETENTION_DAYS = 90;

function dateFromKey(key: string): string | null {
  // Match page:{domain}:{YYYY-MM-DD} or totals:{YYYY-MM-DD}
  const pageMatch = key.match(/^page:.+:(\d{4}-\d{2}-\d{2})$/);
  if (pageMatch) return pageMatch[1];

  const totalsMatch = key.match(/^totals:(\d{4}-\d{2}-\d{2})$/);
  if (totalsMatch) return totalsMatch[1];

  return null;
}

function isExpiredDate(dateStr: string): boolean {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  cutoff.setHours(0, 0, 0, 0);
  const entryDate = new Date(dateStr);
  return entryDate < cutoff;
}

function isExpiredCache(value: unknown): boolean {
  if (
    typeof value === "object" &&
    value !== null &&
    "expires_at" in value
  ) {
    return (value as { expires_at: number }).expires_at < Date.now();
  }
  return false;
}

export async function pruneOldEntries(): Promise<void> {
  const allData = await chrome.storage.local.get(null);
  const keysToRemove: string[] = [];

  for (const [key, value] of Object.entries(allData)) {
    // Check date-based entries (page:*, totals:*)
    const date = dateFromKey(key);
    if (date && isExpiredDate(date)) {
      keysToRemove.push(key);
      continue;
    }

    // Check cache entries (geo_cache:*, green_cache:*, carbon_intensity:*)
    if (
      (key.startsWith("geo_cache:") ||
        key.startsWith("green_cache:") ||
        key.startsWith("carbon_intensity:")) &&
      isExpiredCache(value)
    ) {
      keysToRemove.push(key);
    }
  }

  if (keysToRemove.length > 0) {
    await chrome.storage.local.remove(keysToRemove);
  }
}

export function setupCleanupAlarm(): void {
  chrome.alarms.create("cleanup", {
    periodInMinutes: 1440, // 24 hours
  });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "cleanup") {
      pruneOldEntries();
    }
  });
}
