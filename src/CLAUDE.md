# Frontend guide (`src/`)

Vite · React 18 · TypeScript · Tailwind · React Router 6 · Supabase JS.
Read [the repo guide](../CLAUDE.md) first — its working rules apply here.

## Layers

Each directory is a layer. Imports only ever point *down* this list, never up.

| Layer | Directory | Contains | Must not |
| --- | --- | --- | --- |
| Routes | `pages/`, `pages/app/`, `pages/admin/` | one default-exported component per route, composing sections | export anything reused elsewhere; hold data-access logic |
| Composition | `components/` | layouts, guards, shared UI primitives | import from `pages/` |
| State | `hooks/` | every hook that owns state, effects, or subscriptions | contain JSX beyond a trivial wrapper |
| Logic | `lib/` | pure functions, the Supabase client, storage adapters | import React or contain JSX |
| Fixtures | `data/` | static seed data lifted from the Figma frames | import anything |
| Assets | `assets/` | committed images and icons, plus `figmaAssets.ts` | — |

`pages/app/*` is the educator shell, `pages/admin/*` the super-admin console, and
everything directly in `pages/` is either marketing or auth. A page never
imports from a sibling page.

## Where a new thing goes

- **Reused by two callers** → `components/` (UI), `hooks/` (stateful), `lib/`
  (pure). Never leave the second caller importing from the first.
- **Primitives for one shell only** → the shell's bundle file: `adminBits.tsx`
  for the admin console, `wizardBits.tsx` for the signup wizards. Add to the
  existing bundle rather than creating a parallel one; promote a primitive to its
  own file (`Avatar.tsx`, `Logo.tsx`, `OtpInput.tsx`) once a third shell uses it.
- **A page section over ~80 lines, or repeated across pages** → its own
  component. Pages above ~400 lines should be split into section components in
  `components/`; several existing ones are over that line and are the exception,
  not the pattern to copy.
- **A route** → `App.tsx` only. It is the single routing table: nested under the
  right layout, wrapped in `RequireRole` where the area is restricted.

## Data access

**Pages do not talk to Supabase.** Server reads and writes live in `hooks/`
(when they own state) or `lib/` (when they are a plain call), and pages consume
the result. `useSession`, `useProfile`, `useMessages` and `useSignupFlow` are the
shape to follow: they export typed domain objects, not raw Postgrest rows.

Existing exceptions — `LoginPage`, `ForgotPasswordPage`, `ResetPasswordPage`,
`SignupFormPage`, the two signup wizards, `AppSettingsPage`, `TenantsPage`,
`AdminAccessPage` — call `supabase` inline. Treat them as legacy: do not copy the
pattern, and lift the call into a hook when you are already changing that file
for another reason.

Select explicit column lists, never `select("*")`. Let RLS do the filtering —
never add a client-side `.eq()` whose only job is to re-implement a policy, and
never assume a query is safe because a guard hid the screen.

## The unconfigured-backend contract

`lib/supabase.ts` exports `supabase` as `SupabaseClient | null` — null whenever
the env vars are absent. **Every feature must work with it null.** The
established fallbacks:

- auth forms show `NOT_CONFIGURED_NOTICE` instead of failing
- `useProfile` returns the presentation account from `lib/demoAccounts.ts`
- `RequireRole` enforces against the demo role, and stays open with nobody signed in
- `useMessages` serves `DEMO_THREADS` from localStorage and sets `isDemo`
- educator students and behaviour logs come from `lib/educatorStore.ts`
  (localStorage over the `data/students.ts` seed)

New server-backed code adds its own fallback in the same shape. A page that
crashes or dead-ends without a backend is a bug — the whole app has to stay
walkthrough-able with no `.env.local`.

`lib/educatorStore.ts` is a stopgap: students, behaviour logs and the
`insighted.*` localStorage keys are meant to become Supabase tables. Anything new
that belongs on the server goes to the server, not into that file.

## Styling

- **Design tokens live in `tailwind.config.js`.** Use the token
  (`ink`, `brand`, `teal`, `body`, `muted`, `line`, `sidebar`, `adminrail`,
  `authink`…), never a raw hex. A colour that has no token gets a token added
  before it gets used, and tone maps like `CHIP_TONES` in `adminBits.tsx` are how
  variants are expressed — not a `className` string assembled at the call site.
- `max-w-shell` (1280px) is the standard container; the Figma export was 1440px
  absolute positioning converted to flow layout.
- Every screen is responsive down to mobile even where the frame is desktop-only.
  The educator rail hides under `md` and a mobile tab bar covers it — a new shell
  needs the same treatment.
- Accessibility is not optional and is not in the design: keep the skip link,
  visible focus rings and `prefers-reduced-motion` support in `index.css`. New
  interactive markup gets real semantics — `role="progressbar"` with `aria-value*`
  on meters, `aria-hidden` on decorative chips, labels on every input.

## Conventions

- Default-export the component a file is named after; named-export everything
  else. Files are `PascalCase.tsx` for components, `camelCase.ts` for hooks and
  lib, `useThing` for hooks.
- Props are typed inline in the signature for small components (see
  `adminBits.tsx`); a named `type` once the shape is shared or over ~5 fields.
- Discriminated unions and `as const` maps over boolean flags.
- No `any`. No `!` non-null assertion outside `main.tsx`.
- Roles come from `UserRole` in `hooks/useProfile.ts` — the single source. Check
  access with `heldRoles()` / `activeRoleOf()`, never `profile.role ===` directly,
  so accounts holding two roles are not locked out of either.
- Loading state must settle before a guard redirects. `useProfile.loading` starts
  `true` for exactly this reason; a guard that redirects while loading bounces
  legitimate users to `/login`.

## Installed but unused

`@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`,
`recharts` and `date-fns` are in `package.json` and imported nowhere. Server
state is hand-rolled `useState` + `useEffect`, forms are controlled by hand,
charts are inline SVG.

Do not introduce one of them into a single file ad hoc — that leaves two
patterns for the same job. Adopting one is a deliberate repo-wide step: wire the
provider (react-query needs a `QueryClientProvider` in `main.tsx`, which is not
there), write the first hook as the reference, record the pattern in this file.
Until then, follow the existing hand-rolled patterns. Removing the unused
dependencies instead is equally valid.

## Before reporting done

- `npm run build` passes.
- Works with `.env.local` present *and* absent.
- No raw hex, no `select("*")`, no Supabase call added to a page.
- Keyboard-reachable, focus visible, mobile layout intact.
- No comment that only restates the code.
