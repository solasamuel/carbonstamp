import { validateEnv } from "@shared/env";

validateEnv();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "PAGE_RESOURCES") {
    // TODO: Process resources, call APIs, calculate carbon, update badge
    sendResponse({ status: "received" });
  }
  return true;
});

console.log("CarbonStamp background worker loaded");
