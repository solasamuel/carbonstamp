import { describe, it, expect, vi, beforeEach } from "vitest";
import { storePageResult, getDailyTotal } from "@background/storage";
import type { PageResult, DailyTotal } from "@shared/types";

const storageData: Record<string, unknown> = {};
const mockChrome = {
  storage: {
    local: {
      get: vi.fn((keys: string[]) =>
        Promise.resolve(
          Object.fromEntries(
            keys.filter((k) => k in storageData).map((k) => [k, storageData[k]])
          )
        )
      ),
      set: vi.fn((items: Record<string, unknown>) => {
        Object.assign(storageData, items);
        return Promise.resolve();
      }),
    },
  },
};

vi.stubGlobal("chrome", mockChrome);

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(storageData).forEach((k) => delete storageData[k]);
});

describe("storePageResult", () => {
  const baseResult: PageResult = {
    grade: "B",
    co2_grams: 0.25,
    transfer_kb: 512,
    visits: 1,
    green_host: false,
  };

  // T-024: Stores page result under correct key schema
  it("stores under page:{domain}:{date} key (T-024)", async () => {
    await storePageResult("example.com", "2026-04-12", baseResult);

    expect(mockChrome.storage.local.set).toHaveBeenCalled();
    const calls = mockChrome.storage.local.set.mock.calls;
    const allKeys = calls.flatMap((c) => Object.keys(c[0]));
    expect(allKeys).toContain("page:example.com:2026-04-12");
  });

  it("stored value has expected fields (T-024)", async () => {
    await storePageResult("example.com", "2026-04-12", baseResult);

    const stored = storageData["page:example.com:2026-04-12"] as PageResult;
    expect(stored.grade).toBe("B");
    expect(stored.co2_grams).toBe(0.25);
    expect(stored.transfer_kb).toBe(512);
    expect(stored.visits).toBe(1);
    expect(stored.green_host).toBe(false);
  });

  // T-025: Increments visit count on repeat visits
  it("increments visit count on repeat visits (T-025)", async () => {
    // First visit
    storageData["page:example.com:2026-04-12"] = {
      grade: "B",
      co2_grams: 0.25,
      transfer_kb: 512,
      visits: 2,
      green_host: false,
    };

    const newResult: PageResult = {
      grade: "B",
      co2_grams: 0.30,
      transfer_kb: 600,
      visits: 1,
      green_host: false,
    };

    await storePageResult("example.com", "2026-04-12", newResult);

    const stored = storageData["page:example.com:2026-04-12"] as PageResult;
    expect(stored.visits).toBe(3);
  });

  // T-026: Updates daily totals correctly
  it("updates daily totals correctly (T-026)", async () => {
    storageData["totals:2026-04-12"] = {
      total_co2_grams: 50,
      page_count: 10,
    } as DailyTotal;

    await storePageResult("newsite.com", "2026-04-12", {
      ...baseResult,
      co2_grams: 3,
    });

    const totals = storageData["totals:2026-04-12"] as DailyTotal;
    expect(totals.total_co2_grams).toBe(53);
    expect(totals.page_count).toBe(11);
  });

  it("creates daily totals if none exist", async () => {
    await storePageResult("first.com", "2026-04-12", baseResult);

    const totals = storageData["totals:2026-04-12"] as DailyTotal;
    expect(totals.total_co2_grams).toBe(0.25);
    expect(totals.page_count).toBe(1);
  });
});

describe("getDailyTotal", () => {
  it("returns stored totals", async () => {
    storageData["totals:2026-04-12"] = {
      total_co2_grams: 42.5,
      page_count: 100,
    };

    const result = await getDailyTotal("2026-04-12");

    expect(result.total_co2_grams).toBe(42.5);
    expect(result.page_count).toBe(100);
  });

  it("returns zeros for missing date", async () => {
    const result = await getDailyTotal("2026-01-01");

    expect(result.total_co2_grams).toBe(0);
    expect(result.page_count).toBe(0);
  });
});
