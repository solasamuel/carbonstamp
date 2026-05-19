import { describe, it, expect } from "vitest";
import {
  categoriseResource,
  buildPayload,
  type ResourceCategory,
} from "@content/collect";

describe("categoriseResource", () => {
  it("categorises img initiatorType as image", () => {
    expect(categoriseResource("img")).toBe("image");
  });

  it("categorises css initiatorType as css", () => {
    expect(categoriseResource("css")).toBe("css");
  });

  it("categorises link with .css URL as css", () => {
    expect(categoriseResource("link", "https://example.com/style.css")).toBe(
      "css"
    );
  });

  it("categorises link with .woff2 URL as font", () => {
    expect(
      categoriseResource("link", "https://example.com/font.woff2")
    ).toBe("font");
  });

  it("categorises script initiatorType as script", () => {
    expect(categoriseResource("script")).toBe("script");
  });

  it("categorises font initiatorType as font", () => {
    expect(categoriseResource("font")).toBe("font");
  });

  it("categorises unknown initiatorType as other", () => {
    expect(categoriseResource("xmlhttprequest")).toBe("other");
  });
});

describe("buildPayload", () => {
  const mockEntries = [
    {
      name: "https://example.com/logo.png",
      initiatorType: "img",
      transferSize: 50000,
      decodedBodySize: 80000,
    },
    {
      name: "https://example.com/app.js",
      initiatorType: "script",
      transferSize: 120000,
      decodedBodySize: 300000,
    },
    {
      name: "https://example.com/style.css",
      initiatorType: "css",
      transferSize: 15000,
      decodedBodySize: 40000,
    },
    {
      name: "https://example.com/font.woff2",
      initiatorType: "font",
      transferSize: 25000,
      decodedBodySize: 25000,
    },
    {
      name: "https://example.com/api/data",
      initiatorType: "xmlhttprequest",
      transferSize: 5000,
      decodedBodySize: 12000,
    },
  ];

  it("returns all resources with categories", () => {
    const payload = buildPayload("example.com", mockEntries);
    expect(payload.resources).toHaveLength(5);
  });

  it("calculates correct totalTransferSize", () => {
    const payload = buildPayload("example.com", mockEntries);
    expect(payload.totalTransferSize).toBe(215000);
  });

  it("sets the domain correctly", () => {
    const payload = buildPayload("example.com", mockEntries);
    expect(payload.domain).toBe("example.com");
  });

  it("sets message type to PAGE_RESOURCES", () => {
    const payload = buildPayload("example.com", mockEntries);
    expect(payload.type).toBe("PAGE_RESOURCES");
  });

  it("assigns correct category to each resource", () => {
    const payload = buildPayload("example.com", mockEntries);
    const categories = payload.resources.map(
      (r: { category: ResourceCategory }) => r.category
    );
    expect(categories).toEqual(["image", "script", "css", "font", "other"]);
  });

  it("handles empty resource list", () => {
    const payload = buildPayload("example.com", []);
    expect(payload.resources).toHaveLength(0);
    expect(payload.totalTransferSize).toBe(0);
  });

  it("handles resources with transferSize of 0", () => {
    const cached = [
      {
        name: "https://example.com/cached.js",
        initiatorType: "script",
        transferSize: 0,
        decodedBodySize: 50000,
      },
    ];
    const payload = buildPayload("example.com", cached);
    expect(payload.resources[0].transferSize).toBe(0);
    expect(payload.totalTransferSize).toBe(0);
  });
});
