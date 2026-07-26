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
| `/for-schools` | ✅ Built — hero, trust bar, benefits, pricing, pilot form | `264:1861` |
| `/for-parents` | ✅ Built — hero, plans, support cards, privacy, FAQ | `264:2389` |
| `/for-specialists` | ✅ Built — hero, roles, engagement, criteria, application | `264:2747` |
| `/pricing` | ✅ Built — audience toggle, tiers, comparison table, FAQ | `264:3156` |
| `/resources` | ✅ Built — search, filters, card grid, pagination | `264:4241` |
| `/about` | ✅ Built — mission, values, team, advisors, awards | `260:3600` |
| `/login` | ✅ Built — "Welcome Back" card, Supabase auth wired | `1:198` |
| `/signup` | ✅ Built — choose-path role selector | `186:1103` |
| `/signup/teacher` | ✅ Built — 4-step wizard + account-created state | `186:1185`, `1297`, `1356`, `1415`, `1564` |
| `/signup/specialist` | ✅ Built — 4-step wizard + account-created state | `326:5898`, `6004`, `6053`, `367:4332`, `326:6195` |
| `/signup/parent` | ⚠️ Interim — single form; **Figma has no parent sign-up design** | — |
| `/forgot-password`, `/reset-password` | ⚠️ Built on Supabase auth, no Figma frame found | — |
| Header (marketing) | ✅ Built | `264:1826` |
| Footer (marketing) | ✅ Built | `316:3267` |

Auth routes render inside `AuthLayout` (slim portal chrome), not the marketing
`SiteLayout` — that's how the Figma auth frames are designed.

### Sign-up wizards — what's real and what isn't

The teacher and specialist wizards share `SignupWizardLayout`, `OtpInput` and
`wizardBits`. Steps 2 and 3 (email code, SMS code) are **presentational**:
Supabase sends a confirmation *link*, not a 6-digit code, and no SMS provider is
wired up, so entering any 6 digits advances the wizard. The account is really
created by the Supabase `signUp` call on the final step. Before launch, either
swap these for Supabase OTP (`signInWithOtp`) or drop the two steps.

### ⚠️ Figma frames that are mislabelled

The auth area of the file has several traps — check content, not layer names:

- `326:5898` / `326:6004` / `326:6053` are named **"P-019/020/021 Teacher
  Signup"** but contain the **Specialist** flow (duplicated without renaming).
  The real teacher flow is `186:*`.
- `367:4332` is named **"Link Your Children"** (a parent screen) and its layer
  tree still holds that content, but what renders is a **specialist "Your Access
  Code"** card sitting on top at the same coordinates. Two different screens
  occupy one frame.
- `1:2010` **"Parent Onboarding Page"** is `hidden` on the canvas, and its copy
  cites **FERPA/HIPAA** — US frameworks, inconsistent with the Australian APP
  framing everywhere else. It looks deprecated.

### No parent sign-up flow exists

There are no parent equivalents of `P-019…P-023`. The only parent-specific
artefacts are the two conflicted frames above, so `/signup/parent` still uses
the generic form rather than an invented multi-step flow. Design the parent
screens (or confirm "Link Your Children" is the intended step 2) and it can be
built the same way as the other two.

## Conventions

- **Design tokens live in `tailwind.config.js`.** Colours read out of the Figma file are named there (`ink`, `brand`, `teal`, `body`, `muted`, `line`…). Use the token, not a raw hex.
- **The Figma export is absolutely positioned at 1440px.** It's been converted to flow layout with `max-w-shell` (1280px) containers, so the pages are responsive down to mobile. Desktop rendering matches the frames.
- **Skip link, visible focus rings, and `prefers-reduced-motion` are in `src/index.css`** — not in the design, but required to ship.

## Assets

Icons and images for the six marketing pages are **downloaded and committed**:

- `src/assets/icons/` — SVG icons exported from Figma
- `src/assets/resources/` — Resources covers + author avatars (resized to 800px / 96px, JPEG)
- `src/assets/about/` — mission illustration, team and advisor photos, award marks

### ⚠️ The landing page still uses expiring URLs

`src/assets/figmaAssets.ts` points at temporary Figma URLs that expire roughly 7
days after export. Those links now download fine, so before deploying:

1. Save each URL into `src/assets/`.
2. Swap the constant to a local import — `import heroIllustration from "./hero-ecosystem.png";`

Every component imports from that one file, so nothing else changes.

## Remaining screens in the Figma file

Around 100 frames total. The 6 marketing pages are now built; what's left:

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
