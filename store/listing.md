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

CarbonStamp does NOT request `tabs`, `history`, `webRequest`, or any permission that would let it see your browsing across other tabs.

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

### Content script on `<all_urls>`
Required because the carbon footprint estimate is meaningful only if the extension can read the `PerformanceResourceTiming` entries on every page the user visits. The content script reads only performance timing data (transferred bytes per resource) — it never reads page content, form data, cookies, or DOM. Restricting it to specific URL patterns would defeat the extension's purpose.

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
