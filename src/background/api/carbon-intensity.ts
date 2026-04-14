import { GLOBAL_AVERAGE_INTENSITY } from "@shared/constants";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CarbonIntensityCache {
  intensity: number;
  expires_at: number;
}

function cacheKey(countryCode: string): string {
  return `carbon_intensity:${countryCode}`;
}

async function getCached(
  countryCode: string
): Promise<number | null> {
  const key = cacheKey(countryCode);
  const result = await chrome.storage.local.get([key]);
  const cached = result[key] as CarbonIntensityCache | undefined;

  if (cached && cached.expires_at > Date.now()) {
    return cached.intensity;
  }
  return null;
}

async function setCache(
  countryCode: string,
  intensity: number
): Promise<void> {
  const data: CarbonIntensityCache = {
    intensity,
    expires_at: Date.now() + CACHE_TTL_MS,
  };
  await chrome.storage.local.set({ [cacheKey(countryCode)]: data });
}

export async function lookupCarbonIntensity(
  countryCode: string,
  apiKey: string
): Promise<number> {
  const cached = await getCached(countryCode);
  if (cached !== null) return cached;

  try {
    const url = `https://api.electricitymap.org/v3/carbon-intensity/latest?zone=${countryCode}`;
    const response = await fetch(url, {
      headers: { "auth-token": apiKey },
    });

    if (!response.ok) {
      return GLOBAL_AVERAGE_INTENSITY;
    }

    const data = await response.json();
    const intensity: number = data.carbonIntensity ?? GLOBAL_AVERAGE_INTENSITY;

    await setCache(countryCode, intensity);
    return intensity;
  } catch {
    return GLOBAL_AVERAGE_INTENSITY;
  }
}
