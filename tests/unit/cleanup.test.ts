import { describe, it, expect, vi, beforeEach } from "vitest";
import { pruneOldEntries, setupCleanupAlarm } from "@background/cleanup";

const storageData: Record<string, unknown> = {};
const mockChrome = {
  storage: {
    local: {
      get: vi.fn(() => Promise.resolve({ ...storageData })),
      remove: vi.fn((keys: string[]) => {
        for (const k of keys) delete storageData[k];
        return Promise.resolve();
      }),
    },
  },
  alarms: {
    create: vi.fn(),
    onAlarm: {
      addListener: vi.fn(),
    },
  },
};

vi.stubGlobal("chrome", mockChrome);

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(storageData).forEach((k) => delete storageData[k]);
});

function dateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

describe("pruneOldEntries", () => {
  // T-027: Prunes entries older than 90 days
  it("removes page entries older than 90 days (T-027)", async () => {
    const old = dateNDaysAgo(100);
    const recent = dateNDaysAgo(10);

    storageData[`page:old.com:${old}`] = { grade: "A", co2_grams: 0.1 };
    storageData[`page:recent.com:${recent}`] = { grade: "B", co2_grams: 0.3 };
    storageData[`totals:${old}`] = { total_co2_grams: 5, page_count: 10 };
    storageData[`totals:${recent}`] = { total_co2_grams: 20, page_count: 40 };

    await pruneOldEntries();

    const removedKeys = mockChrome.storage.local.remove.mock.calls[0][0] as string[];
    expect(removedKeys).toContain(`page:old.com:${old}`);
    expect(removedKeys).toContain(`totals:${old}`);
    expect(removedKeys).not.toContain(`page:recent.com:${recent}`);
    expect(removedKeys).not.toContain(`totals:${recent}`);
  });

  it("keeps entries exactly 90 days old", async () => {
    const exactly90 = dateNDaysAgo(90);
    storageData[`page:edge.com:${exactly90}`] = { grade: "C", co2_grams: 0.4 };

    await pruneOldEntries();

    if (mockChrome.storage.local.remove.mock.calls.length > 0) {
      const removedKeys = mockChrome.storage.local.remove.mock.calls[0][0] as string[];
      expect(removedKeys).not.toContain(`page:edge.com:${exactly90}`);
    }
  });

  // T-028: Prunes expired cache entries
  it("removes expired geo_cache entries (T-028)", async () => {
    storageData["geo_cache:old.com"] = {
      country: "US",
      carbon_intensity: 400,
      expires_at: Date.now() - 86400000,
    };
    storageData["geo_cache:fresh.com"] = {
      country: "NO",
      carbon_intensity: 30,
      expires_at: Date.now() + 86400000,
    };

    await pruneOldEntries();

    const removedKeys = mockChrome.storage.local.remove.mock.calls[0][0] as string[];
    expect(removedKeys).toContain("geo_cache:old.com");
    expect(removedKeys).not.toContain("geo_cache:fresh.com");
  });

  it("removes expired green_cache entries (T-028)", async () => {
    storageData["green_cache:old.com"] = {
      is_green: true,
      expires_at: Date.now() - 1000,
    };
    storageData["green_cache:fresh.com"] = {
      is_green: false,
      expires_at: Date.now() + 604800000,
    };

    await pruneOldEntries();

    const removedKeys = mockChrome.storage.local.remove.mock.calls[0][0] as string[];
    expect(removedKeys).toContain("green_cache:old.com");
    expect(removedKeys).not.toContain("green_cache:fresh.com");
  });

  it("handles empty storage gracefully", async () => {
    await pruneOldEntries();
    // Should not call remove, or call with empty array
    if (mockChrome.storage.local.remove.mock.calls.length > 0) {
      const removedKeys = mockChrome.storage.local.remove.mock.calls[0][0] as string[];
      expect(removedKeys).toHaveLength(0);
    }
  });
});

describe("setupCleanupAlarm", () => {
  it("creates a daily alarm named 'cleanup'", () => {
    setupCleanupAlarm();

    expect(mockChrome.alarms.create).toHaveBeenCalledWith("cleanup", {
      periodInMinutes: 1440,
    });
  });

  it("registers an onAlarm listener", () => {
    setupCleanupAlarm();

    expect(mockChrome.alarms.onAlarm.addListener).toHaveBeenCalledOnce();
  });
});
