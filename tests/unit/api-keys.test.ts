import { describe, it, expect, vi, beforeEach } from "vitest";
import { getApiKeys, saveApiKeys, hasApiKeys, type ApiKeys } from "@shared/api-keys";

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

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(storageData).forEach((k) => delete storageData[k]);
});

describe("saveApiKeys", () => {
  it("stores keys under 'apiKeys' in chrome.storage.local", async () => {
    await saveApiKeys({
      ip2locationKey: "abc123",
      electricityMapsKey: "xyz789",
    });

    expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
      apiKeys: {
        ip2locationKey: "abc123",
        electricityMapsKey: "xyz789",
      },
    });
  });
});

describe("getApiKeys", () => {
  it("returns stored keys", async () => {
    storageData["apiKeys"] = {
      ip2locationKey: "abc123",
      electricityMapsKey: "xyz789",
    };

    const keys = await getApiKeys();

    expect(keys.ip2locationKey).toBe("abc123");
    expect(keys.electricityMapsKey).toBe("xyz789");
  });

  it("returns empty strings when no keys stored", async () => {
    const keys = await getApiKeys();

    expect(keys.ip2locationKey).toBe("");
    expect(keys.electricityMapsKey).toBe("");
  });
});

describe("hasApiKeys", () => {
  it("returns true when both keys are present", async () => {
    storageData["apiKeys"] = {
      ip2locationKey: "abc123",
      electricityMapsKey: "xyz789",
    };

    expect(await hasApiKeys()).toBe(true);
  });

  it("returns false when ip2location key is missing", async () => {
    storageData["apiKeys"] = {
      ip2locationKey: "",
      electricityMapsKey: "xyz789",
    };

    expect(await hasApiKeys()).toBe(false);
  });

  it("returns false when electricity maps key is missing", async () => {
    storageData["apiKeys"] = {
      ip2locationKey: "abc123",
      electricityMapsKey: "",
    };

    expect(await hasApiKeys()).toBe(false);
  });

  it("returns false when no keys stored at all", async () => {
    expect(await hasApiKeys()).toBe(false);
  });
});
