# MiZanova — web front end

React front end built from the Figma file `UZ69SK3oHm9TxtmwDGQIQx`.

**Stack:** Vite · React 18 · TypeScript · Tailwind CSS · React Router

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

## Deployment

**Netlify — https://insightedaus.netlify.app** is the primary target, configured
in [`netlify.toml`](netlify.toml). It serves from the domain root, so Vite's
`base` stays `/` and the SPA redirect rule makes deep links like
`/app/students` survive a refresh.

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Site configuration
→ Environment variables** in Netlify, then redeploy — Vite inlines env vars at
build time, so changing them requires a rebuild, not just a restart.

A GitHub Pages workflow also still exists at
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). It sets
`GITHUB_PAGES=true`, which switches `base` to `/InsightED/`. **Both targets
deploy on push to `main`** — delete the workflow if you only want Netlify,
otherwise two live copies drift apart.

Both of those still carry the old **InsightED** name, because they're external
identifiers rather than app strings: the Netlify subdomain, and the `/InsightED/`
base path, which has to match the GitHub repo name. Renaming the site or the
repo means updating the URL above and `base` in
[`vite.config.ts`](vite.config.ts) to match — until then, leave them alone or
the GitHub Pages build serves broken asset paths.

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

### Educator app (`/app`)

Finishing the teacher wizard lands here. All routes render inside `AppLayout`
(dark rail + search/profile bar).

| Route | Status | Figma node |
| --- | --- | --- |
| `/app` | ✅ Classroom Overview — stat cards, trend sparklines | `1:495` |
| `/app/students` | ✅ Student Directory table | `1:1370` |
| `/app/students/new` | ✅ Add a new student | `301:2163` |
| `/app/students/:id` | ✅ Student profile — timeline, notes, attendance gauge | `1:1006` |
| `/app/messages` | ✅ Secure Communication | `1:1797` |
| `/app/schedule` | ✅ Today's Agenda | `1:1478` |
| `/app/settings` | ⚠️ Own design — **no educator settings frame in Figma** | — |

Notes on the app screens:

- **Not wired to data.** The roster lives in `src/data/students.ts`, taken from
  the frames. Nothing persists — "Save Student", "Quick Log" and sending a
  message are inert.
- **Avatars are initials, not photos** (`components/Avatar.tsx`). The frames use
  portraits of people who don't exist; swap for real `<img>` once profile
  photos come from the backend.
- **A mobile tab bar was added.** The app frames are desktop-only (1440px) and
  the rail hides under `md`, which would leave phones unnavigable.

Auth routes render inside `AuthLayout` (slim portal chrome), not the marketing
`SiteLayout` — that's how the Figma auth frames are designed.

### Sign-up wizards — what's real and what isn't

The teacher and specialist wizards share `SignupWizardLayout`, `OtpInput`,
`wizardBits` and the auth primitives in [`useSignupFlow`](src/hooks/useSignupFlow.ts).

Steps 2 and 3 verify **real** one-time codes. Because Supabase can only confirm
an email or phone for a user that already exists, the account is created at
**step 1**; the final step attaches the remaining details via `updateUser`.

    step 1  signUp()                      → account created, email code sent
    step 2  verifyOtp(type:'signup')      → email confirmed, session issued
    step 3  updateUser({phone})           → SMS sent
            verifyOtp(type:'phone_change')→ phone confirmed
    step 4  updateUser({data})            → school / access code saved

Phone numbers are normalised to E.164 by `toE164()` — Supabase rejects spaces
and a leading `0` (`0412 345 678` → `+61412345678`).

**Required Supabase configuration** (the wizard blocks without it):

| Setting | Where | Value |
| --- | --- | --- |
| Confirm email | Auth → Providers → Email | **on** |
| Signup template | Auth → Email Templates → Confirm signup | must contain `{{ .Token }}` |
| Phone provider | Auth → Providers → Phone | enabled + Twilio credentials |

If "Confirm email" is off, step 1 returns a session and the wizard skips step 2
rather than dead-ending. If the phone provider is off, step 3 shows an
actionable error and cannot be passed.

Supabase's built-in mailer is capped at a few messages per hour — fine for
testing, but wire up SMTP (Resend, SendGrid, SES) before any real volume.

Finishing the wizard drops the new educator at `/app` — Professional
Verification isn't built, so both buttons on the account-created screen go
there. Without Supabase keys, step 4 skips account creation and shows the
completed state anyway so the walkthrough doesn't dead-end.

### ⚠️ Figma frames that are mislabelled

Several frames have layer names that don't match their content — check the
content, not the name:

- `301:2163` is named **"Student Roster Table"** but contains the **Add a new
  student** form. The real roster is `1:1370`.

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
- `src/assets/brand/` — MiZanova logo, generated from the 4000px master PNG:
  `mizanova-mark.png` (512px brain mark) and `mizanova-logo.png` (640px full
  lockup with wordmark + tagline). `public/` holds the favicon and touch icon
  cut from the same mark.

Both brand PNGs have the white background flood-filled to transparency. That
also clears the white line-work wherever it connects to the outside — the
scales and the seam between the hemispheres — so on a dark surface the mark
needs a white chip behind it. [`Logo`](src/components/Logo.tsx) does this via
`tone="light"`; don't drop the bare PNG onto the footer or the app rail.

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

- The Figma file predates the MiZanova rename and still says "InsightED" throughout. The header frame also has two overlapping wordmark text layers — one blue, one white (invisible on the white bar). Neither is rendered any more; the header uses [`Logo`](src/components/Logo.tsx).
- The CTA band (`264:5455`) has a heading and subtext but **no button layer**. I added a "Get Started" button so the section has an action — remove it if that was deliberate.
- The feature grid exports as `grid-cols-2 / grid-rows-2` with three cards, which is a Figma auto-layout export artefact. Rendered as a 3-column grid.
