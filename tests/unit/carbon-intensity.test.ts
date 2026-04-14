import { describe, it, expect, vi, beforeEach } from "vitest";
import { lookupCarbonIntensity } from "@background/api/carbon-intensity";
import { GLOBAL_AVERAGE_INTENSITY } from "@shared/constants";

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

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(storageData).forEach((k) => delete storageData[k]);
});

describe("lookupCarbonIntensity", () => {
  it("calls Electricity Maps API with country code", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ carbonIntensity: 30 }),
    });

    await lookupCarbonIntensity("NO", "test-api-key");

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("api.electricitymap.org");
    expect(url).toContain("NO");
    expect(options.headers["auth-token"]).toBe("test-api-key");
  });

  it("returns carbon intensity value from API", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ carbonIntensity: 475 }),
    });

    const result = await lookupCarbonIntensity("PL", "test-api-key");

    expect(result).toBe(475);
  });

  it("caches result for 1 hour", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ carbonIntensity: 30 }),
    });

    await lookupCarbonIntensity("NO", "test-api-key");

    expect(mockChrome.storage.local.set).toHaveBeenCalledOnce();
    const stored = mockChrome.storage.local.set.mock.calls[0][0] as Record<
      string,
      { intensity: number; expires_at: number }
    >;
    const cached = stored["carbon_intensity:NO"];
    expect(cached.intensity).toBe(30);

    const oneHour = 60 * 60 * 1000;
    expect(cached.expires_at).toBeGreaterThan(Date.now() + oneHour - 1000);
    expect(cached.expires_at).toBeLessThanOrEqual(Date.now() + oneHour + 1000);
  });

  it("uses cached result within TTL", async () => {
    storageData["carbon_intensity:NO"] = {
      intensity: 30,
      expires_at: Date.now() + 3600000,
    };

    const result = await lookupCarbonIntensity("NO", "test-api-key");

    expect(result).toBe(30);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("ignores expired cache and calls API", async () => {
    storageData["carbon_intensity:NO"] = {
      intensity: 30,
      expires_at: Date.now() - 1000,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ carbonIntensity: 35 }),
    });

    const result = await lookupCarbonIntensity("NO", "test-api-key");

    expect(result).toBe(35);
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("falls back to global average on API failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await lookupCarbonIntensity("XX", "test-api-key");

    expect(result).toBe(GLOBAL_AVERAGE_INTENSITY);
  });

  it("falls back to global average on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const result = await lookupCarbonIntensity("XX", "test-api-key");

    expect(result).toBe(GLOBAL_AVERAGE_INTENSITY);
  });
});
