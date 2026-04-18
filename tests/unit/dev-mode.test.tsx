// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import DevMode, { analyseResources, type ResourceFlag } from "@popup/components/DevMode";

const mockResources = [
  {
    name: "https://example.com/photo.jpg",
    initiatorType: "img",
    transferSize: 500000,
    decodedBodySize: 2000000,
    protocol: "h2",
    encodingUsed: false,
  },
  {
    name: "https://example.com/render-block.js",
    initiatorType: "script",
    transferSize: 120000,
    decodedBodySize: 300000,
    protocol: "h2",
    encodingUsed: true,
    isRenderBlocking: true,
  },
  {
    name: "https://example.com/style.css",
    initiatorType: "css",
    transferSize: 15000,
    decodedBodySize: 40000,
    protocol: "http/1.1",
    encodingUsed: true,
  },
  {
    name: "https://cdn.example.com/lib.js",
    initiatorType: "script",
    transferSize: 80000,
    decodedBodySize: 200000,
    protocol: "h2",
    encodingUsed: true,
    isCdn: true,
  },
];

describe("analyseResources", () => {
  it("flags uncompressed images", () => {
    const flags = analyseResources(mockResources);
    const imageFlags = flags.filter(
      (f) => f.resource === "https://example.com/photo.jpg"
    );
    expect(imageFlags.some((f) => f.type === "uncompressed")).toBe(true);
  });

  it("flags render-blocking scripts", () => {
    const flags = analyseResources(mockResources);
    const scriptFlags = flags.filter(
      (f) => f.resource === "https://example.com/render-block.js"
    );
    expect(scriptFlags.some((f) => f.type === "render-blocking")).toBe(true);
  });

  it("flags resources not using HTTP/2", () => {
    const flags = analyseResources(mockResources);
    const cssFlags = flags.filter(
      (f) => f.resource === "https://example.com/style.css"
    );
    expect(cssFlags.some((f) => f.type === "no-http2")).toBe(true);
  });

  it("does not flag CDN-served resources as missing CDN", () => {
    const flags = analyseResources(mockResources);
    const cdnFlags = flags.filter(
      (f) =>
        f.resource === "https://cdn.example.com/lib.js" &&
        f.type === "no-cdn"
    );
    expect(cdnFlags).toHaveLength(0);
  });

  it("flags resources missing CDN", () => {
    const flags = analyseResources(mockResources);
    const noCdnFlags = flags.filter(
      (f) =>
        f.resource === "https://example.com/render-block.js" &&
        f.type === "no-cdn"
    );
    expect(noCdnFlags).toHaveLength(1);
  });

  it("estimates carbon saving for uncompressed images", () => {
    const flags = analyseResources(mockResources);
    const imgFlag = flags.find(
      (f) =>
        f.resource === "https://example.com/photo.jpg" &&
        f.type === "uncompressed"
    );
    expect(imgFlag?.estimatedSavingKb).toBeGreaterThan(0);
  });
});

describe("DevMode component", () => {
  // T-041: Developer mode toggle enables detailed view
  it("is hidden by default and shows on toggle (T-041)", () => {
    const { container } = render(<DevMode resources={mockResources} />);
    expect(container.querySelector(".dev-mode-content")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /developer/i }));
    expect(container.querySelector(".dev-mode-content")).toBeInTheDocument();
  });

  it("lists resources with size and type", () => {
    const { container } = render(<DevMode resources={mockResources} />);
    fireEvent.click(screen.getByRole("button", { name: /developer/i }));

    const names = container.querySelectorAll(".resource-name");
    const nameTexts = Array.from(names).map((n) => n.textContent);
    expect(nameTexts).toContain("photo.jpg");
    expect(nameTexts).toContain("render-block.js");
  });

  // T-042: Flags uncompressed images
  it("shows uncompressed flag for images (T-042)", () => {
    render(<DevMode resources={mockResources} />);
    fireEvent.click(screen.getByRole("button", { name: /developer/i }));

    expect(screen.getByText(/uncompressed/i)).toBeInTheDocument();
  });

  // T-043: Flags render-blocking scripts
  it("shows render-blocking flag for scripts (T-043)", () => {
    render(<DevMode resources={mockResources} />);
    fireEvent.click(screen.getByRole("button", { name: /developer/i }));

    expect(screen.getByText(/render.blocking/i)).toBeInTheDocument();
  });

  it("shows estimated carbon savings", () => {
    render(<DevMode resources={mockResources} />);
    fireEvent.click(screen.getByRole("button", { name: /developer/i }));

    expect(screen.getByText(/saving/i)).toBeInTheDocument();
  });
});
