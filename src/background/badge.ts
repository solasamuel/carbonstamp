import { BADGE_COLOURS } from "@shared/constants";
import type { Grade } from "@shared/types";

export async function updateBadge(grade: Grade, tabId: number): Promise<void> {
  const colour = BADGE_COLOURS[grade];

  await chrome.action.setBadgeText({ text: grade, tabId });
  await chrome.action.setBadgeBackgroundColor({ color: colour, tabId });
}
