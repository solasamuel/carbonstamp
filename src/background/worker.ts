import { getApiKeys, hasApiKeys } from "@shared/api-keys";
import { lookupGeolocation } from "./api/geolocation";
import { lookupCarbonIntensity } from "./api/carbon-intensity";
import { checkGreenHosting } from "./api/green-hosting";
import { calculateCarbon } from "./carbon-calculator";
import { assignGrade } from "./grading";
import { storePageResult } from "./storage";
import { updateBadge } from "./badge";
import { setupCleanupAlarm } from "./cleanup";
import type { PageResult } from "@shared/types";

setupCleanupAlarm();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PAGE_RESOURCES") {
    handlePageResources(message, sender.tab?.id).then(sendResponse);
    return true; // keep message channel open for async response
  }
});

async function handlePageResources(
  message: { domain: string; totalTransferSize: number },
  tabId?: number
): Promise<{ status: string; grade?: string }> {
  const keysReady = await hasApiKeys();
  if (!keysReady) {
    return { status: "missing_keys" };
  }

  const keys = await getApiKeys();
  const { domain, totalTransferSize } = message;

  // Parallel API lookups
  const [geo, greenHost] = await Promise.all([
    lookupGeolocation(domain, keys.ip2locationKey),
    checkGreenHosting(domain),
  ]);

  const carbonIntensity =
    geo.carbon_intensity > 0
      ? geo.carbon_intensity
      : await lookupCarbonIntensity(geo.country, keys.electricityMapsKey);

  // Check if returning visitor
  const today = new Date().toISOString().slice(0, 10);
  const pageKey = `page:${domain}:${today}`;
  const existing = await chrome.storage.local.get([pageKey]);
  const isReturningVisitor = pageKey in existing;

  // Calculate carbon
  const carbonResult = calculateCarbon({
    transferSizeBytes: totalTransferSize,
    carbonIntensity,
    isGreenHost: greenHost,
    isReturningVisitor,
  });

  const grade = assignGrade(carbonResult.co2_grams);

  // Store result
  const pageResult: PageResult = {
    grade,
    co2_grams: carbonResult.co2_grams,
    transfer_kb: carbonResult.transfer_kb,
    visits: 1,
    green_host: greenHost,
  };
  await storePageResult(domain, today, pageResult);

  // Update badge
  if (tabId) {
    await updateBadge(grade, tabId);
  }

  return { status: "ok", grade };
}

console.log("CarbonStamp background worker loaded");
