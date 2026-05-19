import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateBadge } from "@background/badge";
import type { Grade } from "@shared/types";

const mockChrome = {
  action: {
    setBadgeText: vi.fn(() => Promise.resolve()),
    setBadgeBackgroundColor: vi.fn(() => Promise.resolve()),
  },
};

vi.stubGlobal("chrome", mockChrome);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateBadge", () => {
  // T-029: Badge shows correct grade text
  it("sets badge text to the grade (T-029)", async () => {
    await updateBadge("B", 1);

    expect(mockChrome.action.setBadgeText).toHaveBeenCalledWith({
      text: "B",
      tabId: 1,
    });
  });

  it("sets badge text for A+ grade", async () => {
    await updateBadge("A+", 1);

    expect(mockChrome.action.setBadgeText).toHaveBeenCalledWith({
      text: "A+",
      tabId: 1,
    });
  });

  // T-030: Badge colour is green for A+/A grades
  it("sets green colour for A+ grade (T-030)", async () => {
    await updateBadge("A+", 1);

    expect(mockChrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: "#27AE60",
      tabId: 1,
    });
  });

  it("sets green colour for A grade (T-030)", async () => {
    await updateBadge("A", 1);

    expect(mockChrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: "#27AE60",
      tabId: 1,
    });
  });

  // T-031: Badge colour is amber for B/C grades
  it("sets amber colour for B grade (T-031)", async () => {
    await updateBadge("B", 1);

    expect(mockChrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: "#F39C12",
      tabId: 1,
    });
  });

  it("sets amber colour for C grade (T-031)", async () => {
    await updateBadge("C", 1);

    expect(mockChrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: "#F39C12",
      tabId: 1,
    });
  });

  // T-032: Badge colour is red for D/F grades
  it("sets red colour for D grade (T-032)", async () => {
    await updateBadge("D", 1);

    expect(mockChrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: "#E74C3C",
      tabId: 1,
    });
  });

  it("sets red colour for F grade (T-032)", async () => {
    await updateBadge("F", 1);

    expect(mockChrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: "#E74C3C",
      tabId: 1,
    });
  });

  // All grades produce correct colours
  it("maps all 6 grades to correct colours", async () => {
    const expected: [Grade, string][] = [
      ["A+", "#27AE60"],
      ["A", "#27AE60"],
      ["B", "#F39C12"],
      ["C", "#F39C12"],
      ["D", "#E74C3C"],
      ["F", "#E74C3C"],
    ];

    for (const [grade, colour] of expected) {
      vi.clearAllMocks();
      await updateBadge(grade, 1);

      expect(mockChrome.action.setBadgeText).toHaveBeenCalledWith({
        text: grade,
        tabId: 1,
      });
      expect(mockChrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
        color: colour,
        tabId: 1,
      });
    }
  });
});
