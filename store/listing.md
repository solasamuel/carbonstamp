# Chrome Web Store Listing — CarbonStamp

## Name (max 50 chars)
CarbonStamp — Webpage Carbon Footprint

## Summary / Short description (max 132 chars)
See the carbon footprint of every webpage you visit. Tracks your browsing emissions privately, on your device only.

## Category
Productivity

## Language
English (United Kingdom)

---

## Detailed description (max 16,000 chars)

**CarbonStamp estimates the carbon footprint of every webpage you visit — automatically, privately, and grounded in real grid data.**

Every byte of every page costs energy. CarbonStamp combines transferred page weight, the carbon intensity of the server's electricity grid, and whether the host is on the Green Web Foundation registry to give each page a letter grade from A+ to F, just like websitecarbon.com — but for every page you actually visit, without opening DevTools.

---

### ⚠️ Setup required — bring your own API keys

CarbonStamp needs two free API keys before it can work. This is intentional: it keeps the extension free for everyone and keeps your browsing data completely private — your keys, your account, no shared backend.

**You'll need to sign up for two free accounts (takes about 2 minutes):**

1. **ip2location.io** — free tier covers 30,000 lookups per month  
   https://www.ip2location.io/

2. **Electricity Maps** — free tier for personal/research use  
   https://api.electricitymap.org/

The third data source — **Green Web Foundation** — requires no key.

After installing, open the extension popup and paste your keys into the setup screen. They're stored locally in your browser and never sent anywhere except the APIs themselves.

---

### What it does

📊 **Per-page carbon score**
- Total transferred page weight (KB / MB)
- Estimated energy used (kWh) and CO₂ produced (grams)
- A+ to F letter grade matching the websitecarbon.com methodology
- Real-time grid carbon intensity by hosting country (Norway ≈ 30g CO₂/kWh, Poland ≈ 700g CO₂/kWh)
- Green hosting check via the Green Web Foundation registry

🏆 **Your browsing dashboard**
- Daily, weekly, and monthly cumulative footprint
- Top 10 heaviest sites by average carbon per visit (D3.js chart)
- Annual estimate with relatable comparisons: km driven, short-haul flights, meals of beef

🎨 **Colour-coded badge**
- Green for A+/A, amber for B/C, red for D/F
- Updates automatically on every page load — passive carbon awareness

📤 **Exportable summary**
- Shareable browsing footprint report copied to clipboard

---

### How it works

CarbonStamp uses the browser's built-in **PerformanceResourceTiming API** to measure transferred bytes when each page finishes loading. It then:

1. Looks up the hosting country from the domain (ip2location.io, cached 24h)
2. Fetches the current grid carbon intensity (Electricity Maps, cached 1h)
3. Checks the Green Web Foundation registry for green hosting (cached 7d)
4. Applies the websitecarbon.com open methodology to estimate CO₂

All caching is local. All data stays in your browser.

---

### Privacy — your browsing stays yours

- 🔒 **No backend server.** No account. No telemetry. No tracking.
- 🔒 **No data leaves your browser** except API calls to the three providers (domain only — never full URLs or page content).
- 🔒 **API keys are yours.** Stored in `chrome.storage.local`, never transmitted to anyone except the API providers.
- 🔒 **Local-only storage.** Page history auto-deletes after 90 days.

See the full privacy policy: [included with submission]

---

### Permissions explained

CarbonStamp asks for the minimum permissions needed:

- **storage** — to store your page history and API keys locally
- **alarms** — to run the daily cleanup job that prunes data older than 90 days
- **activeTab** — to read the URL of the page you're currently looking at (only when you open the popup)
- **host permissions** for `api.ip2location.io`, `api.electricitymap.org`, `api.thegreenwebfoundation.org` — the three APIs that power the carbon estimate
- **content script access on all sites** — required so the extension can read transferred bytes (via the browser's PerformanceResourceTiming API) on every page you visit. The script reads **only** the transfer size of each loaded resource — it cannot and does not read page content, form inputs, cookies, passwords, or any element of the page itself. This access is the minimum needed to build a meaningful personal carbon footprint, because that footprint depends on every page you load — not a fixed list of sites.

CarbonStamp does NOT request `tabs`, `history`, `webRequest`, `cookies`, or any permission that would let it see your browsing across other tabs, your browser history, or your network traffic.

---

### Built by

Sola Samuel — founder of Green Atlas, a circular economy manufacturing business targeting West and East African markets. CarbonStamp grew from wanting to understand the carbon cost of digital tools alongside physical supply chains.

---

### Open source

The full source code is published on GitHub: [link in submission]

---

## Single-purpose description

CarbonStamp has a single purpose: estimate and display the carbon footprint of webpages the user visits, and aggregate that into a personal browsing footprint dashboard. It does this by reading transferred page size via PerformanceResourceTiming, looking up the hosting country and its grid carbon intensity, checking green hosting registry status, and computing CO₂ grams per page using the open websitecarbon.com methodology.

---

## Permission justifications (for Chrome Web Store form)

### `storage`
Required to persist user-provided API keys, the carbon score for each visited page (used to compute the dashboard), daily totals, and short-lived caches for the three external APIs. All storage is local (`chrome.storage.local`) and never leaves the browser.

### `alarms`
Required to schedule a once-daily cleanup task that removes page history older than 90 days, keeping the extension within `chrome.storage.local` quota. No other use.

### `activeTab`
Required only to read the URL of the active tab when the user clicks the extension icon. The popup needs the current page's hostname to display that page's carbon score. We deliberately use `activeTab` instead of the broader `tabs` permission because we only need access at the moment the user invokes the popup.

### Content script on `<all_urls>` — addressing the broad host permissions concern

We reviewed the Chrome Web Store guidance on broad host permissions and considered both `activeTab` and narrower `host_permissions` patterns. Neither is workable for CarbonStamp's single purpose, for these specific reasons:

**Why `activeTab` is insufficient.** `activeTab` only grants access in response to a user gesture (clicking the extension icon). The core value of CarbonStamp is *passive, ambient* carbon awareness — the badge icon must update silently as the user browses, building up a personal dashboard of their actual browsing patterns. Requiring the user to click the icon on every page would (a) defeat the product's purpose, (b) miss the vast majority of pages the user actually visits, and (c) make the dashboard's daily/weekly/monthly totals meaningless because data would only exist for pages the user manually inspected.

**Why narrower `host_permissions` are insufficient.** The extension's value depends on measuring carbon across the user's *entire* browsing pattern. A user's personal footprint over a week is a function of every page they load — narrowing to a fixed list of sites would produce a fictional dashboard that excludes most of their actual browsing. There is no defensible static list of "carbon-relevant" websites; carbon-relevance is universal.

**Strict scope of what the content script accesses.** The content script reads exactly one browser API: `window.performance.getEntriesByType("resource")`. From each entry it extracts only four numeric/string fields: resource URL, `initiatorType`, `transferSize`, and `decodedBodySize`. It **never** reads page content, DOM, form inputs, cookies, `localStorage`, `sessionStorage`, network responses, or any element of the page itself. The full source of the content script is ~20 lines and is open source — reviewers can audit it directly.

**Data minimisation.** Only the page's *hostname* (not the full URL) is sent to the three external APIs. Page content is never transmitted anywhere. All historical data is stored locally and auto-deleted after 90 days.

In short: `<all_urls>` is requested because the product's single purpose — estimating personal browsing carbon footprint — is intrinsically universal, but the access is used for the narrowest possible data extraction (page transfer size, nothing else).

### Host permissions: `api.ip2location.io`, `api.electricitymap.org`, `api.thegreenwebfoundation.org`
Required to call the three APIs that supply the data needed to compute a carbon estimate: hosting country, grid carbon intensity, and green hosting status. Only the page's hostname is sent — never full URLs or content.

---

## Remote code use

**No.** CarbonStamp does not execute any remote or hosted code. All JavaScript is bundled at build time and shipped with the extension. The three API calls return JSON only, which is parsed but never `eval`'d.

---

## Data usage declaration (for Chrome Web Store privacy form)

| Data type | Collected? | Notes |
|---|---|---|
| Personally identifiable info | ❌ No | |
| Health info | ❌ No | |
| Financial info | ❌ No | |
| Authentication info | ❌ No | Users provide their own third-party API keys; we do not authenticate to any service ourselves |
| Personal communications | ❌ No | |
| Location | ❌ No | We look up the hosting country of websites, not the user |
| Web history | ⚠️ Local only | Page hostnames + carbon scores stored in `chrome.storage.local` for 90 days. Never transmitted off-device. |
| User activity | ❌ No | |
| Website content | ❌ No | We read `PerformanceResourceTiming` entries (bytes transferred per resource) — never page content, DOM, or form data |

**Certifications:**
- ✅ I do not sell or transfer user data to third parties outside of approved use cases
- ✅ I do not use or transfer user data for purposes unrelated to the extension's single purpose
- ✅ I do not use or transfer user data to determine creditworthiness or for lending purposes
