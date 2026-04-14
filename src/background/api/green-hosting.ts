import type { GreenCache } from "@shared/types";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function cacheKey(domain: string): string {
  return `green_cache:${domain}`;
}

async function getCached(domain: string): Promise<boolean | null> {
  const key = cacheKey(domain);
  const result = await chrome.storage.local.get([key]);
  const cached = result[key] as GreenCache | undefined;

  if (cached && cached.expires_at > Date.now()) {
    return cached.is_green;
  }
  return null;
}

async function setCache(domain: string, isGreen: boolean): Promise<void> {
  const data: GreenCache = {
    is_green: isGreen,
    expires_at: Date.now() + CACHE_TTL_MS,
  };
  await chrome.storage.local.set({ [cacheKey(domain)]: data });
}

export async function checkGreenHosting(domain: string): Promise<boolean> {
  const cached = await getCached(domain);
  if (cached !== null) return cached;

  try {
    const url = `https://api.thegreenwebfoundation.org/api/v3/greencheck/${domain}`;
    const response = await fetch(url);

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    const isGreen: boolean = data.green === true;

    await setCache(domain, isGreen);
    return isGreen;
  } catch {
    return false;
  }
}
