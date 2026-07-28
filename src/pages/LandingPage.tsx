import { Link } from "react-router-dom";
import {
  heroIllustration,
  iconLogBehaviour,
  iconOffline,
  iconValidatedStrategies,
} from "../assets/figmaAssets";

/** Figma: node 1:4 "Landing Page" */

const HERO_PROOF = [
  "🇦🇺 Australian-hosted",
  "APP Compliant",
  "Non-clinical",
  "Evidence-based",
];

const FEATURES = [
  {
    icon: iconLogBehaviour,
    chip: "bg-teal-tint",
    title: "Log behaviour in 20 seconds",
    body: "Three taps. No paperwork. Designed for teachers in the moment to quickly capture essential context without disrupting the class.",
  },
  {
    icon: iconValidatedStrategies,
    chip: "bg-[#FFFBEB]",
    title: "AI + human-validated strategies",
    body: "Every strategy reviewed by safeguarding logic before reaching you. Combining advanced AI with expert-backed methodologies.",
  },
  {
    icon: iconOffline,
    chip: "bg-[#FAF5FF]",
    title: "Works offline, always",
    body: "PWA technology means you can log anywhere, even without internet. Syncs automatically when you're back online.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="px-6 py-12 md:px-20 md:pt-[119px]">
        <div className="mx-auto flex max-w-shell flex-col items-center gap-10 rounded-xl bg-brand-tint px-6 py-[46px] lg:flex-row lg:gap-16">
          <div className="flex w-full flex-col gap-[22.9px] lg:w-[584px] lg:shrink-0">
            <span className="w-fit rounded-full border border-teal-border bg-teal-tint px-3 py-1 text-[11px] font-bold uppercase leading-[16.5px] tracking-[0.55px] text-brand">
              Neurodiversity Ecosystem
            </span>

            <h1 className="text-[34px] font-bold leading-[1.1] tracking-[-1.2px] text-ink md:text-5xl md:leading-[52.8px]">
              Support every learner.
              <br />
              Empower every educator.
            </h1>

            <p className="text-lg leading-[29.25px] text-body">
              Neurodiversity-affirming AI strategies in under 20 seconds. Built
              with educators, validated by specialists, hosted in Australia.
            </p>

            <ul className="flex flex-wrap items-center gap-3 pt-[9.1px]">
              {HERO_PROOF.map((item, i) => (
                <li key={item} className="flex items-center gap-3">
                  {i > 0 && (
                    <span
                      aria-hidden
                      className="h-1 w-1 rounded-full bg-line-strong"
                    />
                  )}
                  <span className="text-[13px] font-medium leading-[19.5px] text-muted">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex w-full items-center justify-center lg:h-[500px] lg:flex-1">
            <img
              src={heroIllustration}
              alt="Illustration of an interconnected support ecosystem linking teachers, parents and specialists"
              className="h-full w-full rounded-card object-cover opacity-90 mix-blend-multiply"
            />
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="bg-white px-6 pb-24 pt-16 md:px-20 md:pt-[149px]">
        <div className="mx-auto max-w-shell border-t border-line-soft px-0 pt-16 md:px-6">
          <h2 className="sr-only">Why MiZanova</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <article
                key={f.title}
                className="flex flex-col items-start gap-[11.1px] rounded-card border border-line-soft bg-white p-8 shadow-card"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-chip ${f.chip}`}
                >
                  <img src={f.icon} alt="" aria-hidden className="h-5 w-5" />
                </div>
                <h3 className="pt-[12.9px] text-xl font-bold leading-7 tracking-[-0.5px] text-ink">
                  {f.title}
                </h3>
                <p className="text-[15px] leading-[24.38px] text-muted">{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand px-6 py-24 md:px-[272px]">
        <div
          aria-hidden
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(0,0,0,0.05) 2.5%, rgba(0,0,0,0) 2.5%), linear-gradient(180deg, rgba(0,0,0,0.05) 2.5%, rgba(0,0,0,0) 2.5%)",
          }}
        />
        <div className="relative mx-auto flex max-w-prose flex-col items-center gap-6 px-0 md:px-6">
          <h2 className="text-center text-[28px] font-bold leading-tight tracking-[-1px] text-white md:text-[40px] md:leading-[60px]">
            Ready to transform support for every learner?
          </h2>
          <p className="max-w-[618px] text-center text-xl leading-7 text-teal-tint opacity-90">
            Join schools across Australia building more inclusive classrooms.
          </p>
          {/* NOTE: the Figma CTA frame (264:5455) contains no button layer.
              Added here so the section has an action — remove if the design is
              intentionally copy-only. */}
          <Link
            to="/signup"
            className="flex h-12 items-center justify-center rounded-lg bg-white px-6 text-base font-semibold text-brand shadow-btn transition-opacity hover:opacity-90"
          >
            Get Started
          </Link>
        </div>
      </section>
    </>
  );
}
