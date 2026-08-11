# MiZanova

Special-education platform: React SPA served from Netlify, Supabase (Postgres +
Auth + Storage + RLS) behind it. Six user roles — teacher, external_teacher,
parent, specialist, school_admin, platform_admin, super_admin — each with its own
app shell.

## The two halves are managed separately

| Half | Owns | Read before touching |
| --- | --- | --- |
| Frontend | `src/`, `index.html`, `vite.config.ts`, `tailwind.config.js`, `public/` | [src/CLAUDE.md](src/CLAUDE.md) |
| Backend | `supabase/`, `scripts/` | [supabase/CLAUDE.md](supabase/CLAUDE.md) |

Read the guide for the half you are in. Do not edit both halves in one pass
unless the task genuinely spans them — and when it does, land the backend
change first (the frontend can only consume what the schema already exposes) and
describe the two parts separately when reporting.

## Working rules

These are not negotiable and apply to both halves.

1. **Never commit, never push, never create branches.** Leave every change in
   the working tree. The user reviews and commits manually. Do not run
   `git add`, `git commit`, `git stash`, or anything that rewrites history.
2. **No unnecessary comments.** A comment earns its place only by recording
   something the code cannot: a constraint, a non-obvious *why*, a workaround for
   external behaviour. Never restate what the line does, never leave section
   banners, TODOs, changelog notes, or "this function now handles X" narration.
   When in doubt, delete it and make the name clearer instead.
3. **One line if it fits on one line.** No intermediate variable used once, no
   `if/else` where a ternary or early return reads the same, no wrapping a
   two-clause expression across four lines. Readability still wins over golf —
   the rule is against padding, not against clarity.
4. **Modular by default.** Every file has one job. Nothing is defined in the
   place it happens to be first used if a second caller is plausible. The layer
   boundaries in each half's guide are the contract; if a change needs to cross
   one, that is a signal the piece belongs elsewhere.
5. **Scope discipline.** Change what was asked. Unrelated problems you notice
   get reported, not fixed in the same pass.
6. **Verify before reporting done.** `npm run build` type-checks and builds; it
   must pass. Backend changes are verified by reading the SQL against the
   policies it touches — there is no test suite in this repo.

## Commands

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build — the only gate that exists
npm run preview
```

## Environment

`.env.local` (never committed) holds `VITE_SUPABASE_URL` plus one of
`VITE_SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_ANON_KEY`. See `.env.example`.

Anything prefixed `VITE_` is inlined into the browser bundle and is public.
The `service_role` / `sb_secret_*` key must never get a `VITE_` prefix, never
appear in `src/`, and never be committed — it bypasses every RLS policy. It is
read from the shell by the scripts in `scripts/` and nowhere else.

Netlify holds the same variables under Site configuration → Environment
variables. Vite inlines them at build time, so changing one needs a rebuild.

## Names that must not be changed casually

The product was renamed from InsightED to MiZanova. Three external identifiers
still carry the old name because they are not app strings:

- the GitHub repo name `InsightED`
- the Netlify subdomain `insightedaus.netlify.app`
- `base: "/InsightED/"` in `vite.config.ts` under `GITHUB_PAGES=true`, which
  must match the repo name or Pages serves broken asset paths

Renaming any of these means updating the others in the same pass. Product-facing
copy says MiZanova.

## Deployment

Netlify is the primary target (`netlify.toml`, SPA redirect so `/app/students`
survives a refresh). A GitHub Pages workflow in `.github/workflows/deploy.yml`
also fires on push to `main` and publishes a second copy under `/InsightED/`.
Both live targets drift apart; if only Netlify is wanted, the workflow should be
deleted rather than left running.
