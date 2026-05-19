# CarbonStamp

> Webpage Carbon Footprint Estimator — a cross-browser extension that estimates the CO₂ cost of every page you visit, based on transferred bytes, the carbon intensity of the hosting grid, and whether the host is on the Green Web Foundation registry.

![Status](https://img.shields.io/badge/status-ready_for_submission-success)
![Tests](https://img.shields.io/badge/tests-173_passing-success)
![Manifest](https://img.shields.io/badge/manifest-v3-blue)

## What it does

CarbonStamp runs silently in the background and gives every page you visit a letter grade from **A+** (cleanest) to **F** (dirtiest), using the open [websitecarbon.com](https://www.websitecarbon.com/) methodology. It builds a private, local-only dashboard of your browsing footprint over time.

- **Per-page score:** grade, CO₂ grams, transfer size (KB/MB), estimated energy (kWh), green-hosting status, and how this page compares to your history
- **Colour-coded badge** on the extension icon: green for A+/A, amber for B/C, red for D/F — passive carbon awareness while you browse
- **Dashboard:** daily / weekly / monthly totals, top 10 heaviest sites (D3.js bar chart), annual estimate with real-world comparisons (km driven, flights, meals of beef)
- **Developer mode:** per-resource breakdown with flags for uncompressed images, render-blocking scripts, no HTTP/2, missing CDN — plus estimated KB savings
- **Export:** shareable footprint summary copied to clipboard

## Setup — bring your own API keys

CarbonStamp needs two free API keys before it can analyse pages. This keeps the extension free for everyone and your browsing data completely private.

1. **ip2location.io** — sign up at https://www.ip2location.io/ (30K requests/month free)
2. **Electricity Maps** — sign up at https://api.electricitymap.org/ (free tier for personal use)
3. **Green Web Foundation** — no key required

After installing the extension, open the popup, paste your keys into the setup screen, and you're done. Keys are stored in `chrome.storage.local` and never leave your browser except to the APIs themselves.

## Privacy

- 🔒 **No backend.** No account. No telemetry. No tracking.
- 🔒 **No data leaves your browser** except API calls to the three providers (hostname only — never full URLs or page content)
- 🔒 **90-day rolling local storage** with automatic cleanup
- 🔒 **Minimum permissions:** `storage`, `alarms`, `activeTab` + the three API host permissions. No `tabs`, no `history`, no `webRequest`

See [`store/privacy-policy.md`](store/privacy-policy.md) for the full policy.

## Tech stack

| Layer | Choice |
|---|---|
| Language | TypeScript (strict) |
| UI | React 19 |
| Charts | D3.js |
| Build | Vite + `@crxjs/vite-plugin` |
| Browser APIs | Manifest V3 service worker, `PerformanceResourceTiming`, `chrome.storage.local`, `chrome.alarms`, `chrome.action` |
| Tests | Vitest (unit), Playwright (e2e), React Testing Library, jsdom |

## Development

```bash
# Install dependencies
npm install

# Dev mode with hot reload
npm run dev

# Then in Chrome: chrome://extensions → Developer mode → Load unpacked → select dist/
```

### Tests

```bash
npm test            # 173 unit tests
npm run test:watch  # watch mode
npm run test:e2e    # Playwright across Chromium and Firefox
```

### Build for release

```bash
npm run build       # outputs dist/
npm run package     # builds and zips dist/ for store submission
```

## Project structure

```
src/
├── background/         # service worker, API clients, calculator, grading, storage, badge, cleanup
├── content/            # PerformanceResourceTiming collector
├── popup/              # React popup: ScoreCard, Dashboard, TopSitesChart, DevMode, OptionsPage
└── shared/             # types, constants, api-keys helper

tests/
├── unit/               # Vitest specs (TDD: each backlog item Red → Green)
└── e2e/                # Playwright smoke tests

docs/                   # Product backlog, test plan, solution architecture
store/                  # Chrome Web Store listing copy + privacy policy
```

## Workflow

- `main` — release branch (Chrome Web Store submissions cut from here)
- `develop` — default working branch
- Feature branches `feature/CS-XXX-name` merge into `develop` via `--no-ff`, each implementing one backlog item with TDD

## Documentation

- [`docs/product-backlog.json`](docs/product-backlog.json) — 22 items across Project Setup, Per-Page Analysis, Popup UI, Dashboard, Dev Mode, Data Management, Distribution
- [`docs/test-plan.json`](docs/test-plan.json) — 58 planned tests across 11 suites
- [`docs/solution-architecture.md`](docs/solution-architecture.md) — system overview, components, data flow, carbon model, manifest, deployment

## Methodology

Carbon calculation uses the [websitecarbon.com open methodology](https://www.websitecarbon.com/how-does-it-work/):

```
co2_grams = (data_gb × 0.81 × visitor_factor × carbon_intensity)
          + (data_gb × 0.52 × 0.25 × 442)
```

- **Energy per GB:** 0.81 kWh (network + data centre combined)
- **Returning visitor factor:** 0.75× on repeat visits (CDN cache assumed)
- **Grid carbon intensity:** real-time from Electricity Maps (~30 g/kWh in Norway to ~700 g/kWh in Poland)
- **Green hosting multiplier:** zeroes the data-centre component when the Green Web Foundation confirms a green host

## License

ISC — see `package.json`.

