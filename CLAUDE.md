# Lead Engine

Automated lead generation and outreach system for Jay's freelance web dev business (jayexe.com). Runs as a Claude scheduled agent every morning — discovers businesses with no website or a poor one, generates custom demo sites, and sends personalized cold emails.

## What it does

1. **Discovery** — queries Google Places API for businesses by city + category
2. **Evaluation** — two separate paths:
   - Path A (no website): scores activity level (Facebook recency, followers, Google reviews)
   - Path B (has website): scores design quality (PageSpeed, mobile, age, Claude visual review)
3. **Demo generation** — Claude generates custom HTML/CSS/JS landing pages, pushed to `jayexe-demos` GitHub repo → auto-deploys to `demos.jayexe.com`
4. **Review** — saves `leads-YYYY-MM-DD.json` + HTML review page, sends Telegram notification
5. **Email outreach** — after Jay approves leads, sends personalized cold emails via Resend

## Commands

```bash
npm test          # run all tests (Vitest)
npm start         # run the lead engine (tsx src/index.ts)
```

## Project structure

```
src/
  types.ts              # shared TypeScript types (Lead, DiscoveredBusiness, etc.)
  index.ts              # main orchestrator
  discovery/
    query-generator.ts  # city × category query rotation
    google-places.ts    # Google Places API client
    facebook-scraper.ts # Playwright-based Facebook scraper
  evaluation/
    path-a-activity.ts  # no-website activity scoring
    path-b-design.ts    # has-website design quality scoring
  storage/
    lead-store.ts       # read/write leads JSON files
  report/
    html-report.ts      # generates HTML review page
  notify/
    telegram.ts         # Telegram bot notifications
tests/                  # mirrors src/ structure, Vitest
```

## Key conventions

- **ESM only** — `"type": "module"` in package.json. All imports need `.js` extension (e.g. `import { foo } from './foo.js'`)
- **NodeNext resolution** — TypeScript uses `"moduleResolution": "NodeNext"`
- **No console.log** — use a proper logger or structured output
- **TDD** — write tests first, then implementation
- **Immutable data** — never mutate objects; return new copies

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Purpose |
|----------|---------|
| `GOOGLE_PLACES_API_KEY` | Google Places API (free tier) |
| `TELEGRAM_BOT_TOKEN` | Telegram bot for lead notifications |
| `TELEGRAM_CHAT_ID` | Your Telegram chat ID |
| `GITHUB_REPO` | GitHub repo for leads storage (e.g. `jayexe-leads`) |
| `GITHUB_TOKEN` | GitHub personal access token |

## Score thresholds

- **Path A (no website)**: score ≥ 40 → qualified lead
- **Path B (has website)**: score < 50 → qualified lead (lower = worse site)

## Related repos

- `jayexe-leads` — private GitHub repo storing JSON leads + HTML review pages (GitHub Pages)
- `jayexe-demos` — private GitHub repo connected to Vercel, hosts demo sites at `demos.jayexe.com`
