import { buildPayload } from "./collect";

window.addEventListener("load", () => {
  const entries = performance.getEntriesByType(
    "resource"
  ) as PerformanceResourceTiming[];

  const rawEntries = entries.map((r) => ({
    name: r.name,
    initiatorType: r.initiatorType,
    transferSize: r.transferSize,
    decodedBodySize: r.decodedBodySize,
  }));

  const payload = buildPayload(document.location.hostname, rawEntries);

  chrome.runtime.sendMessage(payload);
});
