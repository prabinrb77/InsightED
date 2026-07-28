import { useState } from "react";
import { Link } from "react-router-dom";
import iconDailyReports from "../assets/icons/parents-daily-reports.svg";
import iconAiStrategies from "../assets/icons/parents-ai-strategies.svg";
import iconCollaboration from "../assets/icons/parents-collaboration.svg";
import iconLock from "../assets/icons/parents-lock.svg";
import badgeHosted from "../assets/icons/parents-badge-hosted.svg";
import badgeAnon from "../assets/icons/parents-badge-anon.svg";
import badgeGdpr from "../assets/icons/parents-badge-gdpr.svg";
import badgeEncrypted from "../assets/icons/parents-badge-encrypted.svg";

/** Figma: node 264:2389 "P-003 For Parents" */

const PLANS = [
  {
    name: "Essential",
    blurb: "Basic insights for home support.",
    price: "$9.99",
    features: [
      "Daily summary reports",
      "Focus & engagement tracking",
      "5 AI-powered strategies per week",
      "Direct specialist portal access",
    ],
    cta: "Choose Essential",
    featured: false,
  },
  {
    name: "Premium",
    blurb: "Complete advocacy and collaboration.",
    price: "$19.99",
    features: [
      "Real-time classroom updates",
      "Unlimited AI clinical strategies",
      "Direct specialist collaboration portal",
      "IEP/ILP data export tools",
    ],
    cta: "Choose Premium",
    featured: true,
  },
];

const SUPPORT = [
  {
    icon: iconDailyReports,
    surface: "bg-teal-tint border-[rgba(45,106,106,0.1)]",
    title: "Daily Reports",
    body: "No more waiting for parent-teacher night. Get a snapshot of your child's emotional state, focus peaks, and social wins every afternoon.",
  },
  {
    icon: iconAiStrategies,
    surface: "bg-[#FFF7ED] border-[rgba(245,158,11,0.1)]",
    title: "AI Strategies",
    body: "Evidence-based advice based on the day's events. If lunch was loud and difficult, we'll suggest calming sensory activities for after school.",
  },
  {
    icon: iconCollaboration,
    surface: "bg-teal-tint border-[rgba(45,106,106,0.1)]",
    title: "Professional Collaboration",
    body: "Easily share behavioral patterns and engagement data with your child's OT, Psychologist, or Speech Pathologist in one click.",
  },
];

const PRIVACY_BADGES = [
  { icon: badgeHosted, label: "Australian-hosted servers" },
  { icon: badgeAnon, label: "Fully anonymized AI processing" },
  { icon: badgeGdpr, label: "GDPR & APPs Compliant" },
  { icon: badgeEncrypted, label: "Encrypted Data Transmission" },
];

const FAQS = [
  {
    q: "Is there a charge during the trial?",
    a: "No, your first 7 days are completely free. We will only bill you after the trial period ends. You can cancel at any time within the trial window through your account settings with zero hassle.",
  },
  {
    q: "How does the school share data with me?",
    a: "Once your child's school connects your account, classroom logs flow through automatically — you see the same observations their teachers record, as they happen.",
  },
  {
    q: "What if my child's school doesn't use MiZanova?",
    a: "You can still use the parent tools on your own, and we'll help you invite your school. Many schools start after a parent introduces them to MiZanova.",
  },
  {
    q: "Can I share access with my child's therapist?",
    a: "Yes. You control exactly who sees your child's reports, and you can revoke a specialist's access at any time from your account.",
  },
  {
    q: "How specific are the AI strategies?",
    a: "They're tailored to the day's actual events and your child's sensory profile — not generic advice. Every strategy is reviewed against safeguarding logic before it reaches you.",
  },
  {
    q: "Are the reports clinical or easy to read?",
    a: "Written in plain, affirming language for families. Clinical detail is available for specialists you choose to share with.",
  },
];

export default function ForParentsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="overflow-clip bg-teal-tint px-6 py-16 md:px-20 md:py-24">
        <div className="mx-auto grid max-w-shell items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-start">
            <span className="text-[11px] font-bold uppercase leading-[16.5px] tracking-[1.1px] text-amber">
              For Families
            </span>

            <h1 className="pt-4 text-[34px] font-bold leading-[1.1] tracking-[-1.2px] text-ink md:text-5xl md:leading-[52.8px]">
              Be your child's
              <br />
              strongest advocate
            </h1>

            <p className="max-w-[560px] pt-6 text-lg leading-[29.25px] text-body">
              Get real-time updates and evidence-based strategies tailored to
              your child's unique needs. Bridge the gap between school and home
              with data-driven insights.
            </p>

            <div className="flex flex-wrap gap-4 pt-8">
              <Link
                to="/signup"
                className="flex h-12 items-center justify-center rounded-full bg-brand px-8 text-base font-bold text-white shadow-btn transition-colors hover:bg-[#255d99]"
              >
                Start 7-day Free Trial
              </Link>
              <button
                type="button"
                className="flex h-12 items-center justify-center rounded-full border border-line-edge bg-white px-8 text-base font-bold text-brand transition-colors hover:bg-mist"
              >
                See sample report
              </button>
            </div>
          </div>

          {/* Daily report mockup */}
          <div className="w-full rounded-2xl border border-line-edge bg-white p-6 shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.15)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="size-10 shrink-0 rounded-full bg-line-soft"
                />
                <span>
                  <span className="block text-base font-bold leading-6 text-ink">
                    Emma's Daily Report
                  </span>
                  <span className="block text-xs leading-4 text-muted">
                    Today, Oct 24 • Year 3
                  </span>
                </span>
              </div>
              <span className="whitespace-nowrap rounded-full bg-[#DCFCE7] px-2.5 py-1 text-[10px] font-bold uppercase leading-[15px] tracking-[0.5px] text-teal">
                Updated 10m ago
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-3 rounded-xl bg-teal-tint p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold leading-5 text-ink">
                  Engagement Levels
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.55px] text-brand">
                  High
                </span>
              </div>
              <div className="h-2 w-full overflow-clip rounded-full bg-white">
                <div className="h-full w-[82%] rounded-full bg-brand" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase leading-[15px] tracking-[0.5px] text-footext">
                  Focus Triggers
                </span>
                <span className="text-sm font-semibold leading-5 text-ink">
                  Visual Timers, Fidget Tools
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase leading-[15px] tracking-[0.5px] text-footext">
                  Sensory Profile
                </span>
                <span className="text-sm font-semibold leading-5 text-ink">
                  Proprioceptive Seeking
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 rounded-xl border border-[rgba(245,158,11,0.2)] bg-[#FFF7ED] p-4">
              <span className="flex items-center gap-2 text-sm font-bold leading-5 text-amber">
                <span aria-hidden>✦</span>
                Strategy Recommendation
              </span>
              <p className="text-[13px] leading-5 text-body">
                Transitioning to home? Use a 5-minute countdown and a physical
                heavy-work activity to help Emma regulate after the bus ride.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Understanding the day ────────────────────────────── */}
      <section className="bg-white px-6 py-24 md:px-20">
        <div className="mx-auto flex max-w-prose flex-col gap-6 text-center">
          <h2 className="text-4xl font-bold leading-10 tracking-[-1px] text-ink">
            Every parent deserves to understand their child's day
          </h2>
          <p className="text-base leading-[26px] text-body">
            The school day can feel like a black box. You pick up your child and
            see they are overwhelmed, but you don't know why. MiZanova provides
            the missing link—connecting real-time classroom data with actionable
            home strategies, ensuring you never have to guess about triggers or
            emotional regulation needs again.
          </p>
        </div>
      </section>

      {/* ── Plans ────────────────────────────────────────────── */}
      <section className="bg-mist px-6 py-24 md:px-10">
        <div className="mx-auto flex max-w-shell flex-col gap-12">
          <div className="flex flex-col gap-3 text-center">
            <h2 className="text-4xl font-bold leading-10 tracking-[-1px] text-ink">
              A plan for every family
            </h2>
            <p className="text-base leading-6 text-muted">
              Invest in clarity and consistent support for your child's
              neurodivergent journey.
            </p>
          </div>

          <div className="mx-auto grid w-full max-w-4xl items-start gap-8 md:grid-cols-2">
            {PLANS.map((p) => (
              <article
                key={p.name}
                className={[
                  "relative flex flex-col rounded-2xl bg-white p-8",
                  p.featured
                    ? "border-2 border-teal shadow-card"
                    : "border border-line-edge",
                ].join(" ")}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-teal px-4 py-1 text-[10px] font-bold uppercase leading-[15px] tracking-[0.5px] text-white">
                    Recommended
                  </span>
                )}

                <h3 className="text-xl font-bold leading-7 text-ink">
                  {p.name}
                </h3>
                <p className="pt-1 text-sm leading-5 text-muted">{p.blurb}</p>

                <p className="flex items-baseline gap-1 pt-5">
                  <span className="text-4xl font-bold leading-10 text-ink">
                    {p.price}
                  </span>
                  <span className="text-sm font-medium text-muted">/mo</span>
                </p>

                <ul className="flex flex-1 flex-col gap-3 py-6">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm leading-5 text-body"
                    >
                      <span aria-hidden className="text-teal">
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/signup"
                  className={[
                    "flex h-12 items-center justify-center rounded-lg text-base font-bold transition-colors",
                    p.featured
                      ? "bg-brand text-white hover:bg-[#255d99]"
                      : "border border-line-edge bg-white text-brand hover:bg-mist",
                  ].join(" ")}
                >
                  {p.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── How MiZanova supports you ───────────────────────── */}
      <section className="bg-white px-6 py-24 md:px-20">
        <div className="mx-auto flex max-w-shell flex-col gap-16">
          <h2 className="text-center text-4xl font-bold leading-10 tracking-[-1px] text-ink">
            How MiZanova supports you
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {SUPPORT.map((s) => (
              <article
                key={s.title}
                className={`flex flex-col items-start gap-4 rounded-3xl border p-8 ${s.surface}`}
              >
                <div className="flex size-16 items-center justify-center rounded-2xl bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
                  <span className="h-6 w-[27px] overflow-clip">
                    <img src={s.icon} alt="" aria-hidden className="size-full" />
                  </span>
                </div>
                <h3 className="pt-2 text-xl font-bold leading-7 text-ink">
                  {s.title}
                </h3>
                <p className="text-base leading-[26px] text-body">{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Data control ─────────────────────────────────────── */}
      <section className="bg-teal-tint px-6 py-24 md:px-20">
        <div className="mx-auto grid max-w-shell items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-start">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-brand">
              <span className="size-7 overflow-clip">
                <img src={iconLock} alt="" aria-hidden className="size-full" />
              </span>
            </div>
            <h2 className="pt-6 text-4xl font-bold leading-10 tracking-[-1px] text-ink">
              Your child's data, your control
            </h2>
            <p className="max-w-[520px] pt-4 text-base leading-[26px] text-body">
              We treat your family's data with the highest level of security.
              You decide who can see your child's reports, and you can revoke
              access at any time. We follow strict Australian data privacy
              standards.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {PRIVACY_BADGES.map((b) => (
              <div
                key={b.label}
                className="flex items-center gap-4 rounded-2xl bg-white p-5"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-mist">
                  <span className="size-5 overflow-clip">
                    <img src={b.icon} alt="" aria-hidden className="size-full" />
                  </span>
                </span>
                <span className="text-sm font-semibold leading-5 text-ink">
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="bg-white px-6 py-24 md:px-20">
        <div className="mx-auto flex max-w-[900px] flex-col gap-10">
          <h2 className="text-center text-4xl font-bold leading-10 tracking-[-1px] text-ink">
            Frequently Asked Questions
          </h2>

          <div className="flex flex-col gap-3">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={f.q}
                  className="overflow-clip rounded-xl border border-line-edge bg-white"
                >
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      className={[
                        "flex w-full items-center justify-between gap-4 p-6 text-left text-[15px] font-semibold leading-6 text-ink transition-colors",
                        open ? "bg-teal-tint" : "bg-white hover:bg-mist",
                      ].join(" ")}
                    >
                      {f.q}
                      <span
                        aria-hidden
                        className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
                      >
                        ⌄
                      </span>
                    </button>
                  </h3>
                  {open && (
                    <p className="px-6 pb-6 text-sm leading-[22px] text-body">
                      {f.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
