# CarbonStamp — Solution Architecture

**Version:** 1.0  
**Date:** April 2026  
**Author:** Sola Samuel / Spearhead Finance Ltd

---

## 1. System Overview

CarbonStamp is a cross-browser extension (Chrome + Firefox) that estimates the carbon footprint of every webpage a user visits. It operates entirely client-side with no backend server — all data stays in the browser via `chrome.storage.local`.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser Extension                        │
│                                                                 │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────┐  │
│  │Content Script │───>│Background Worker  │───>│   Popup UI   │  │
│  │              │    │                  │    │   (React +   │  │
│  │ Reads        │    │ API calls        │    │    D3.js)    │  │
│  │ Performance  │    │ Carbon calc      │    │              │  │
│  │ Resource     │    │ Storage mgmt     │    │ Score view   │  │
│  │ Timing API   │    │ Badge updates    │    │ Dashboard    │  │
│  └──────────────┘    └───────┬──────────┘    │ Dev mode     │  │
│                              │               └──────────────┘  │
│                    ┌─────────▼─────────┐                       │
│                    │chrome.storage.local│                       │
│                    └───────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   External APIs      │
                    │                      │
                    │ • ip2location.io     │
                    │ • Electricity Maps   │
                    │ • Green Web Found.   │
                    └──────────────────────┘
```

## 2. Component Architecture

### 2.1 Content Script

**Responsibility:** Collect page resource data without DevTools.

- Runs on every page via `window.performance.getEntriesByType("resource")`
- Extracts `transferSize` (compressed bytes over wire) and `decodedBodySize` per resource
- Categorises resources by `initiatorType`: image, script, font, CSS, other
- Sends structured payload to background worker via `chrome.runtime.sendMessage`
- Fires after `load` event to ensure all resources are captured

**Key constraint:** `PerformanceResourceTiming` is available to content scripts — no DevTools panel required. This is the core enabler of CarbonStamp's silent background operation.

### 2.2 Background Worker (Service Worker)

**Responsibility:** Orchestrate API calls, calculate carbon, manage storage, update badge.

```
Message from Content Script
        │
        ▼
┌─ Extract domain from URL
│
├─ Geo lookup (ip2location.io)
│   └─ Cached? → use cache : call API → cache 24h
│
├─ Carbon intensity (Electricity Maps)
│   └─ Cached? → use cache : call API → cache 1h
│
├─ Green host check (Green Web Foundation)
│   └─ Cached? → use cache : call API → cache 7d
│
├─ Run carbon calculation formula
│
├─ Assign letter grade (A+ through F)
│
├─ Store result → chrome.storage.local
│   ├─ page:{domain}:{date}
│   └─ totals:{YYYY-MM-DD}
│
└─ Update badge text + colour
```

**Fallback strategy:** If any API call fails, the worker continues with conservative defaults (global average 442 gCO2/kWh for carbon intensity, `is_green: false` for green hosting).

### 2.3 Popup UI (React + D3.js)

**Responsibility:** Present current page score and historical dashboard.

Three views within the popup:

| View | Contents |
|------|----------|
| **Current Page** | Letter grade badge, CO2 grams, transfer size (KB/MB), energy (kWh), green hosting status, percentile comparison, resource breakdown |
| **Dashboard** | Daily/weekly/monthly totals, top 10 heaviest sites (D3.js horizontal bar chart), annual estimate with real-world comparisons, export button |
| **Developer Mode** | Per-resource breakdown, optimisation flags (uncompressed images, render-blocking scripts, no HTTP/2, missing CDN), estimated carbon savings |

### 2.4 Badge

**Responsibility:** Passive carbon awareness signal on the extension icon.

| Grade | Colour | Hex |
|-------|--------|-----|
| A+, A | Green  | `#27AE60` |
| B, C  | Amber  | `#F39C12` |
| D, F  | Red    | `#E74C3C` |

Uses `chrome.action.setBadgeText` and `chrome.action.setBadgeBackgroundColor`.

## 3. Data Architecture

### 3.1 Storage Schema

All data stored in `chrome.storage.local` — no server, no account, complete privacy.

| Key Pattern | Value Structure | TTL |
|-------------|-----------------|-----|
| `page:{domain}:{YYYY-MM-DD}` | `{ grade, co2_grams, transfer_kb, visits, green_host }` | 90 days |
| `totals:{YYYY-MM-DD}` | `{ total_co2_grams, page_count }` | 90 days |
| `geo_cache:{domain}` | `{ country, carbon_intensity, expires_at }` | 24 hours |
| `green_cache:{domain}` | `{ is_green, expires_at }` | 7 days |

### 3.2 Storage Limits

- `chrome.storage.local` limit: **10 MB**
- 90-day rolling window keeps storage well within bounds
- Daily cleanup via `chrome.alarms` prunes expired entries
- Estimated storage for 500 domains/day over 90 days: ~2-3 MB

### 3.3 Data Flow

```
Page Load
  │
  ▼
Content Script collects PerformanceResourceTiming entries
  │
  ▼
chrome.runtime.sendMessage({ domain, resources[], totalTransferSize })
  │
  ▼
Background Worker receives message
  │
  ├──> Parallel API lookups (geo, carbon intensity, green host)
  │    All with cache-first strategy
  │
  ▼
Carbon calculation → grade assignment → storage write → badge update
  │
  ▼
Popup reads from chrome.storage.local on open
```

## 4. External API Integration

### 4.1 API Summary

| API | Purpose | Free Tier | Auth | Cache TTL |
|-----|---------|-----------|------|-----------|
| **ip2location.io** | IP/domain → country mapping | 30K requests/month | API key (query param) | 24 hours |
| **Electricity Maps** | Country → grid carbon intensity (gCO2/kWh) | 100 requests/month | API key (header) | 1 hour |
| **Green Web Foundation** | Domain → green hosting boolean | Unlimited | None | 7 days |

### 4.2 Caching Strategy

Aggressive caching minimises API calls and stays within free tiers:

- **Geolocation:** Domain hosting country changes rarely — 24h cache is safe
- **Carbon intensity:** Grid mix changes hourly — 1h cache balances accuracy vs quota
- **Green hosting:** Registry updates infrequently — 7d cache is appropriate
- All caches use `chrome.storage.local` with `expires_at` timestamps
- Expired entries are cleaned by the daily `chrome.alarms` job

### 4.3 Rate Limiting Considerations

With caching in place, typical daily API usage:
- **ip2location.io:** ~50-100 new domains/day (well within 30K/month)
- **Electricity Maps:** ~20-30 unique countries/day (well within 100/month with 1h cache)
- **Green Web Foundation:** ~50-100 new domains/day (unlimited tier)

## 5. Carbon Calculation Model

Based on the **websitecarbon.com open methodology**:

```
co2_grams = (data_gb × 0.81 × visitor_factor × carbon_intensity)
           + (data_gb × 0.52 × 0.25 × 442)
```

| Variable | Value / Source |
|----------|---------------|
| `data_gb` | `transferSize` sum / 1,073,741,824 |
| Energy per GB | 0.81 kWh (network + data centre combined) |
| `visitor_factor` | 1.0 first visit, 0.75 returning (CDN cache assumed) |
| `carbon_intensity` | Electricity Maps API by country (gCO2/kWh) |
| Green hosting | Zeroes data centre energy component if green host confirmed |
| Global average fallback | 442 gCO2/kWh |

### 5.1 Grading Thresholds

Aligned with websitecarbon.com for credibility and comparability:

| Grade | CO2 per page load |
|-------|-------------------|
| A+    | < 0.095 g |
| A     | < 0.185 g |
| B     | < 0.341 g |
| C     | < 0.493 g |
| D     | < 0.656 g |
| F     | >= 0.656 g |

### 5.2 Real-World Comparison Factors

For the annual estimate feature:

| Comparison | Conversion Factor |
|------------|-------------------|
| km driven (average car) | 1 km = ~121 g CO2 |
| Short-haul flights | 1 flight = ~255 kg CO2 |
| Meals of beef | 1 meal = ~3.3 kg CO2 |

## 6. Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Language | TypeScript | Type safety, better DX, catches API contract issues at compile time |
| UI Framework | React | Component model suits the popup's multiple views; fast rendering |
| Charting | D3.js | Full control over the horizontal bar chart; lightweight for extension context |
| Browser APIs | PerformanceResourceTiming, chrome.storage, chrome.action, chrome.alarms | Core extension platform APIs |
| Build | Vite + CRXJS | Modern bundler with first-class browser extension support |
| Testing | Vitest + Playwright | Unit tests for calculation engine; E2E for cross-browser validation |
| Cross-browser | webextension-polyfill | Normalises Chrome/Firefox API differences |

## 7. Extension Manifest

Manifest V3 (Chrome) with V2 fallback for Firefox if needed:

```json
{
  "manifest_version": 3,
  "name": "CarbonStamp",
  "version": "1.0.0",
  "description": "Estimates the carbon footprint of every webpage you visit",
  "permissions": [
    "storage",
    "alarms",
    "activeTab"
  ],
  "host_permissions": [
    "https://api.ip2location.io/*",
    "https://api.electricitymap.org/*",
    "https://api.thegreenwebfoundation.org/*"
  ],
  "background": {
    "service_worker": "src/background/index.ts"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["src/content/index.ts"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": "icons/icon-48.png"
  }
}
```

## 8. Project Structure

```
carbonstamp/
├── src/
│   ├── background/
│   │   ├── index.ts              # Service worker entry
│   │   ├── api/
│   │   │   ├── geolocation.ts    # ip2location.io client
│   │   │   ├── carbon-intensity.ts # Electricity Maps client
│   │   │   └── green-hosting.ts  # Green Web Foundation client
│   │   ├── carbon-calculator.ts  # Calculation engine + grading
│   │   ├── storage.ts            # chrome.storage.local operations
│   │   ├── badge.ts              # Badge text + colour updates
│   │   └── cleanup.ts           # 90-day data pruning alarm
│   ├── content/
│   │   └── index.ts              # PerformanceResourceTiming collector
│   ├── popup/
│   │   ├── index.html
│   │   ├── App.tsx               # React root
│   │   ├── components/
│   │   │   ├── ScoreCard.tsx     # Current page grade + stats
│   │   │   ├── ResourceBreakdown.tsx
│   │   │   ├── Dashboard.tsx     # Totals + top 10 chart
│   │   │   ├── TopSitesChart.tsx # D3.js horizontal bar chart
│   │   │   ├── AnnualEstimate.tsx
│   │   │   ├── DevMode.tsx       # Developer optimisation view
│   │   │   └── ExportButton.tsx
│   │   └── hooks/
│   │       └── useStorage.ts     # Hook for reading chrome.storage
│   └── shared/
│       ├── types.ts              # Shared TypeScript interfaces
│       └── constants.ts          # Grade thresholds, colours, conversion factors
├── tests/
│   ├── unit/
│   │   ├── carbon-calculator.test.ts
│   │   ├── grading.test.ts
│   │   ├── storage.test.ts
│   │   └── api-clients.test.ts
│   └── e2e/
│       └── extension.test.ts
├── icons/
├── manifest.json
├── vite.config.ts
├── tsconfig.json
├── package.json
└── docs/
    ├── product-backlog.json
    ├── test-plan.json
    └── solution-architecture.md   # (this file)
```

## 9. Privacy & Security

- **No backend server** — all data stored locally in `chrome.storage.local`
- **No user account** — no sign-up, no tracking, no telemetry
- **Minimal permissions** — only `storage`, `alarms`, and `activeTab`
- **API calls are domain-only** — full URLs are never sent to external services
- **Content script reads only performance data** — no DOM content is accessed
- **90-day auto-purge** — data does not accumulate indefinitely

## 10. Cross-Browser Strategy

| Aspect | Chrome | Firefox |
|--------|--------|---------|
| Manifest | V3 | V3 (FF109+) or V2 fallback |
| API namespace | `chrome.*` | `browser.*` via webextension-polyfill |
| Service worker | Supported | Supported (FF109+) |
| Store | Chrome Web Store | Firefox Add-ons (AMO) |
| Review time | ~1-3 days | ~1-5 days |

The `webextension-polyfill` library normalises API differences. Build produces two outputs from the same source via Vite configuration.

## 11. Build & Deployment

```
npm run dev        # Development mode with hot reload (CRXJS)
npm run build      # Production build for both Chrome and Firefox
npm run test       # Run Vitest unit tests
npm run test:e2e   # Run Playwright cross-browser tests
npm run package    # Create .zip files for store submission
```

### Store Submission Checklist

- [ ] Chrome Web Store developer account ($5 one-time fee)
- [ ] Firefox Add-ons developer account (free)
- [ ] Store listing copy with Green Atlas narrative
- [ ] Screenshots of popup (score view, dashboard, dev mode)
- [ ] Privacy policy (local-only data storage)
- [ ] Extension icons (16, 48, 128px)
