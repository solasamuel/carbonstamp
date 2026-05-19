# CarbonStamp Privacy Policy

**Last updated:** 2026-04-19  
**Effective version:** 1.0.0

## Summary

CarbonStamp is a browser extension that estimates the carbon footprint of webpages you visit. We have designed it to keep your data on your device. There is no backend server, no user account, no analytics, and no advertising.

## What CarbonStamp stores on your device

CarbonStamp uses `chrome.storage.local` (your browser's local storage, scoped to this extension) to store:

| Data | Purpose | Retention |
|---|---|---|
| API keys you enter | To call the three external APIs needed for carbon estimates | Until you delete them or uninstall |
| Hostname + carbon score per visited page (per day) | To build your personal dashboard | Auto-deleted after 90 days |
| Daily total CO₂ + page count | To show daily/weekly/monthly trends | Auto-deleted after 90 days |
| API response cache (country, carbon intensity, green hosting status) | To minimise external API calls | 1 hour to 7 days |

**None of this data is transmitted off your device by CarbonStamp.**

## What CarbonStamp sends over the network

CarbonStamp makes outbound calls to exactly three third-party APIs, and only sends the data each one needs:

1. **ip2location.io** — receives the **hostname** of the page you visited (for example, `wikipedia.org`). Used to look up the hosting country. Cached for 24 hours.

2. **Electricity Maps (api.electricitymap.org)** — receives a **country code** (for example, `NO` or `DE`). Used to look up the current grid carbon intensity. Cached for 1 hour.

3. **Green Web Foundation (api.thegreenwebfoundation.org)** — receives the **hostname** of the page you visited. Used to check whether the site is green-hosted. Cached for 7 days.

We never send:
- Full URLs (only hostnames)
- Page content, DOM, form inputs, cookies, or any browser data
- Identifiers about you
- Information about other tabs you have open

You provide your own API keys for the first two services. Their data practices are governed by their own privacy policies. We recommend reviewing them:

- ip2location.io: https://www.ip2location.io/privacy
- Electricity Maps: https://www.electricitymaps.com/privacy-policy
- Green Web Foundation: https://www.thegreenwebfoundation.org/privacy/

## What CarbonStamp does NOT do

- Does not run any analytics or telemetry
- Does not send any data to servers operated by CarbonStamp or its author
- Does not read page content, form data, cookies, or local storage of any website
- Does not request the `tabs`, `history`, `webRequest`, `cookies`, or any other broad-access permission
- Does not include any tracking pixels, advertising SDKs, or third-party scripts
- Does not execute any remote code — all JavaScript is bundled at install time

## Permissions used

- **storage** — to store your data locally
- **alarms** — to schedule the daily 90-day cleanup
- **activeTab** — to read the hostname of the page you are currently looking at, only when you open the extension popup
- **content script on `<all_urls>`** — to read `PerformanceResourceTiming` (bytes transferred per resource) when each page finishes loading. This is the only way to measure page weight without DevTools open.
- **host permissions** for `api.ip2location.io`, `api.electricitymap.org`, `api.thegreenwebfoundation.org` — to call the three APIs above

## Deletion

To remove all data CarbonStamp has stored:

1. Open the extension popup → Settings → clear your API keys, or
2. Right-click the extension icon → Remove from Chrome — this deletes all stored data instantly, or
3. Open `chrome://extensions` → CarbonStamp → Details → Site settings → clear data

## Children

CarbonStamp is not directed at children under 13. It collects no personal information from any user.

## Changes

If this policy changes materially, the version number and date at the top will be updated and the new policy will ship with the next extension release.

## Contact

For questions, open an issue on the GitHub repository (link in the Chrome Web Store listing) or email the author at the address shown in the developer profile.
