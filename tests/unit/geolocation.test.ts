import { describe, it, expect, vi, beforeEach } from "vitest";
import { lookupGeolocation } from "@background/api/geolocation";
import type { GeoCache } from "@shared/types";

// Mock chrome.storage.local
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

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(storageData).forEach((k) => delete storageData[k]);
});

describe("lookupGeolocation", () => {
  it("calls ip2location.io API with the domain", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ country_code: "US", country_name: "United States" }),
    });

    await lookupGeolocation("example.com", "test-api-key");

    expect(mockFetch).toHaveBeenCalledOnce();
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("api.ip2location.io");
    expect(url).toContain("example.com");
    expect(url).toContain("test-api-key");
  });

  it("returns country code and caches result for 24 hours", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ country_code: "DE", country_name: "Germany" }),
    });

    const result = await lookupGeolocation("example.de", "test-api-key");

    expect(result.country).toBe("DE");
    expect(mockChrome.storage.local.set).toHaveBeenCalledOnce();

    const storedValue = mockChrome.storage.local.set.mock
      .calls[0][0] as Record<string, GeoCache>;
    const cached = storedValue["geo_cache:example.de"];
    expect(cached.country).toBe("DE");

    const twentyFourHours = 24 * 60 * 60 * 1000;
    const expectedExpiry = Date.now() + twentyFourHours;
    expect(cached.expires_at).toBeGreaterThan(expectedExpiry - 1000);
    expect(cached.expires_at).toBeLessThanOrEqual(expectedExpiry + 1000);
  });

  it("uses cached result if within TTL", async () => {
    const cached: GeoCache = {
      country: "NO",
      carbon_intensity: 30,
      expires_at: Date.now() + 86400000,
    };
    storageData["geo_cache:example.no"] = cached;

    const result = await lookupGeolocation("example.no", "test-api-key");

    expect(result.country).toBe("NO");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("ignores expired cache and calls API", async () => {
    const expired: GeoCache = {
      country: "NO",
      carbon_intensity: 30,
      expires_at: Date.now() - 1000,
    };
    storageData["geo_cache:example.no"] = expired;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ country_code: "NO" }),
    });

    const result = await lookupGeolocation("example.no", "test-api-key");

    expect(result.country).toBe("NO");
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("returns fallback on API failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await lookupGeolocation("broken.com", "test-api-key");

    expect(result.country).toBe("UNKNOWN");
    expect(result.carbon_intensity).toBe(442);
  });

  it("returns fallback on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 });

    const result = await lookupGeolocation("ratelimited.com", "test-api-key");

    expect(result.country).toBe("UNKNOWN");
    expect(result.carbon_intensity).toBe(442);
  });
});
