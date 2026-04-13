import type { GeoCache } from "@shared/types";
import { GLOBAL_AVERAGE_INTENSITY } from "@shared/constants";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function cacheKey(domain: string): string {
  return `geo_cache:${domain}`;
}

async function getCached(domain: string): Promise<GeoCache | null> {
  const key = cacheKey(domain);
  const result = await chrome.storage.local.get([key]);
  const cached = result[key] as GeoCache | undefined;

  if (cached && cached.expires_at > Date.now()) {
    return cached;
  }
  return null;
}

async function setCache(domain: string, data: GeoCache): Promise<void> {
  await chrome.storage.local.set({ [cacheKey(domain)]: data });
}

const FALLBACK: GeoCache = {
  country: "UNKNOWN",
  carbon_intensity: GLOBAL_AVERAGE_INTENSITY,
  expires_at: 0,
};

export async function lookupGeolocation(
  domain: string,
  apiKey: string
): Promise<GeoCache> {
  const cached = await getCached(domain);
  if (cached) return cached;

  try {
    const url = `https://api.ip2location.io/?key=${apiKey}&hostname=${domain}`;
    const response = await fetch(url);

    if (!response.ok) {
      return FALLBACK;
    }

    const data = await response.json();
    const result: GeoCache = {
      country: data.country_code ?? "UNKNOWN",
      carbon_intensity: 0, // Will be filled by Electricity Maps lookup
      expires_at: Date.now() + CACHE_TTL_MS,
    };

    await setCache(domain, result);
    return result;
  } catch {
    return FALLBACK;
  }
}
