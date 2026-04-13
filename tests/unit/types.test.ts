import { describe, it, expect } from "vitest";
import type {
  PageResult,
  DailyTotal,
  GeoCache,
  GreenCache,
  ResourceEntry,
} from "@shared/types";

describe("shared types", () => {
  it("PageResult has the correct shape", () => {
    const result: PageResult = {
      grade: "A",
      co2_grams: 0.15,
      transfer_kb: 512,
      visits: 1,
      green_host: true,
    };
    expect(result.grade).toBe("A");
    expect(result.co2_grams).toBe(0.15);
    expect(result.transfer_kb).toBe(512);
    expect(result.visits).toBe(1);
    expect(result.green_host).toBe(true);
  });

  it("DailyTotal has the correct shape", () => {
    const total: DailyTotal = {
      total_co2_grams: 42.5,
      page_count: 100,
    };
    expect(total.total_co2_grams).toBe(42.5);
    expect(total.page_count).toBe(100);
  });

  it("GeoCache has the correct shape", () => {
    const cache: GeoCache = {
      country: "NO",
      carbon_intensity: 30,
      expires_at: Date.now() + 86400000,
    };
    expect(cache.country).toBe("NO");
    expect(cache.carbon_intensity).toBe(30);
    expect(cache.expires_at).toBeGreaterThan(Date.now());
  });

  it("GreenCache has the correct shape", () => {
    const cache: GreenCache = {
      is_green: true,
      expires_at: Date.now() + 604800000,
    };
    expect(cache.is_green).toBe(true);
    expect(cache.expires_at).toBeGreaterThan(Date.now());
  });

  it("ResourceEntry has the correct shape", () => {
    const entry: ResourceEntry = {
      name: "https://example.com/image.png",
      initiatorType: "img",
      transferSize: 102400,
      decodedBodySize: 204800,
    };
    expect(entry.name).toBe("https://example.com/image.png");
    expect(entry.initiatorType).toBe("img");
    expect(entry.transferSize).toBe(102400);
    expect(entry.decodedBodySize).toBe(204800);
  });
});
