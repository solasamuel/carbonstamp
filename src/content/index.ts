window.addEventListener("load", () => {
  const resources = performance.getEntriesByType(
    "resource"
  ) as PerformanceResourceTiming[];

  const payload = resources.map((r) => ({
    name: r.name,
    initiatorType: r.initiatorType,
    transferSize: r.transferSize,
    decodedBodySize: r.decodedBodySize,
  }));

  chrome.runtime.sendMessage({
    type: "PAGE_RESOURCES",
    domain: document.location.hostname,
    resources: payload,
    totalTransferSize: payload.reduce((sum, r) => sum + r.transferSize, 0),
  });
});
