# InsightED — web front end

React front end built from the Figma file `UZ69SK3oHm9TxtmwDGQIQx`.

**Stack:** Vite · React 18 · TypeScript · Tailwind CSS · React Router

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

## What's built

| Route | Status | Figma node |
| --- | --- | --- |
| `/` | ✅ Built — hero, feature band, CTA | `1:4` |
| Header (all pages) | ✅ Built | `264:1826` |
| Footer (all pages) | ✅ Built | `316:3267` |
| `/for-schools` … `/signup` | Stubbed, node IDs wired | see `src/App.tsx` |

## Conventions

- **Design tokens live in `tailwind.config.js`.** Colours read out of the Figma file are named there (`ink`, `brand`, `teal`, `body`, `muted`, `line`…). Use the token, not a raw hex.
- **The Figma export is absolutely positioned at 1440px.** It's been converted to flow layout with `max-w-shell` (1280px) containers, so the pages are responsive down to mobile. Desktop rendering matches the frames.
- **Skip link, visible focus rings, and `prefers-reduced-motion` are in `src/index.css`** — not in the design, but required to ship.

## ⚠️ Assets expire in ~7 days

Every image and icon in `src/assets/figmaAssets.ts` points at a temporary Figma URL. Figma's CDN is firewalled from this environment so I couldn't download them. Before you commit or deploy:

1. Open each URL in your browser and save the file into `src/assets/`.
2. Swap the constant to a local import — `import heroIllustration from "./hero-ecosystem.png";`

Every component imports from that one file, so nothing else changes.

## Remaining screens in the Figma file

Around 100 frames total. Grouped roughly:

- **Marketing (6):** For Schools, For Parents, For Specialists, Pricing (+ Parents view), Resources, About
- **Auth & onboarding (~20):** Login, 2FA, account recovery, role selector, teacher signup steps 1–4, parent signup steps 2–4, professional activation, link-your-children, account-created states
- **Educator app (~10):** Classroom overview, student profile, student roster, daily schedule, messages hub, behaviour logging modal, strategy coach, settings
- **Parent app (~12):** Home dashboard, progress highlights, observations, messages, goals & IEP, collab & finance, 5 settings screens
- **Specialist app (~12):** Command centre, caseload directory, clinical session entry, clinical profile, resource hub, compliance hub, scheduler, 6 settings screens
- **School admin (~11):** Command centre, KPIs, directory & access control, safeguarding, resource allocation, 6 settings screens
- **Super admin (~8):** Global command centre, tenant management, MLOps & AI governance, security & compliance, billing, infrastructure, settings & RBAC
- **Shared:** sidebars, role switchers, notification panels, toasts

## Notes on gaps in the design

- The header frame has two overlapping "InsightED" text layers — one blue, one white (invisible on the white bar). Only the blue one is rendered; the white one looks like a leftover.
- The CTA band (`264:5455`) has a heading and subtext but **no button layer**. I added a "Get Started" button so the section has an action — remove it if that was deliberate.
- The feature grid exports as `grid-cols-2 / grid-rows-2` with three cards, which is a Figma auto-layout export artefact. Rendered as a 3-column grid.
