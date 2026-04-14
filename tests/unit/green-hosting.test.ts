import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkGreenHosting } from "@background/api/green-hosting";
import type { GreenCache } from "@shared/types";

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

describe("checkGreenHosting", () => {
  it("calls Green Web Foundation API with domain", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ green: true, hosted_by: "Google" }),
    });

    await checkGreenHosting("google.com");

    expect(mockFetch).toHaveBeenCalledOnce();
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("api.thegreenwebfoundation.org");
    expect(url).toContain("google.com");
  });

  it("returns true for green-hosted domains", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ green: true }),
    });

    const result = await checkGreenHosting("green-host.com");

    expect(result).toBe(true);
  });

  it("returns false for non-green domains", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ green: false }),
    });

    const result = await checkGreenHosting("dirty-host.com");

    expect(result).toBe(false);
  });

  it("caches result under green_cache:{domain} with 7-day TTL", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ green: true }),
    });

    await checkGreenHosting("google.com");

    expect(mockChrome.storage.local.set).toHaveBeenCalledOnce();
    const stored = mockChrome.storage.local.set.mock.calls[0][0] as Record<
      string,
      GreenCache
    >;
    const cached = stored["green_cache:google.com"];
    expect(cached.is_green).toBe(true);

    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    expect(cached.expires_at).toBeGreaterThan(Date.now() + sevenDays - 1000);
    expect(cached.expires_at).toBeLessThanOrEqual(Date.now() + sevenDays + 1000);
  });

  it("uses cached result within TTL", async () => {
    const cached: GreenCache = {
      is_green: true,
      expires_at: Date.now() + 604800000,
    };
    storageData["green_cache:google.com"] = cached;

    const result = await checkGreenHosting("google.com");

    expect(result).toBe(true);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("ignores expired cache and calls API", async () => {
    const expired: GreenCache = {
      is_green: true,
      expires_at: Date.now() - 1000,
    };
    storageData["green_cache:google.com"] = expired;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ green: false }),
    });

    const result = await checkGreenHosting("google.com");

    expect(result).toBe(false);
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("defaults to false on API failure (conservative estimate)", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await checkGreenHosting("broken.com");

    expect(result).toBe(false);
  });

  it("defaults to false on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

    const result = await checkGreenHosting("down.com");

    expect(result).toBe(false);
  });
});
