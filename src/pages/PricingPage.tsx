import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import iconCheck from "../assets/icons/pricing-check.svg";
import iconRemote from "../assets/icons/pricing-remote.svg";
import iconPilot from "../assets/icons/pricing-pilot.svg";
import iconCustom from "../assets/icons/pricing-custom.svg";

/** Figma: node 264:3156 "P-005 Pricing" */

const SCHOOL_TIERS = [
  {
    name: "Small Schools",
    scale: "≤150 students",
    price: "$2,400",
    period: "/ term",
    annual: "or $8,000 / year (save 16%)",
    inheritLabel: null,
    features: [
      "All teachers & staff",
      "Parent accounts included",
      "AI classroom strategies",
      "Daily student reports",
      "Safeguarding workflow",
      "Compliance dashboard",
      "Email support",
      "Offline mode access",
    ],
    cta: "Start for Small Schools",
    featured: false,
  },
  {
    name: "Mid-size Schools",
    scale: "150-600 students",
    price: "$5,800",
    period: "/ term",
    annual: "or $19,500 / year (save 15%)",
    inheritLabel: "Everything in Small, plus:",
    features: [
      "Specialist review queue",
      "Multi-campus support",
      "Advanced behavior analytics",
      "Priority support (phone + chat)",
      "Quarterly outcomes reports",
      "Custom data exports",
    ],
    cta: "Start for Mid-size Schools",
    featured: true,
  },
  {
    name: "Large Schools",
    scale: "600+ students",
    price: "Custom",
    period: "",
    annual: "Enterprise scale pricing",
    inheritLabel: "Everything in Mid, plus:",
    features: [
      "Dedicated success manager",
      "Custom LMS integrations",
      "Single Sign-On (SAML/SSO)",
      "Full API access",
      "White-labeled parent portal",
      "Annual on-site staff training",
    ],
    cta: "Contact Sales",
    featured: false,
  },
];

const PARENT_TIERS = [
  {
    name: "Essential",
    scale: "Basic insights for home support.",
    price: "$9.99",
    period: "/ mo",
    annual: "Billed monthly, cancel anytime",
    inheritLabel: null,
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
    scale: "Complete advocacy and collaboration.",
    price: "$19.99",
    period: "/ mo",
    annual: "Billed monthly, cancel anytime",
    inheritLabel: "Everything in Essential, plus:",
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

const HIGHLIGHTS = [
  {
    icon: iconRemote,
    title: "Remote/Low-SES",
    body: "40% off for eligible schools",
  },
  {
    icon: iconPilot,
    title: "Pilot Programs",
    body: "60-90 day free school pilots",
  },
  {
    icon: iconCustom,
    title: "Custom needs?",
    body: "Talk to our sales experts",
  },
];

/** [Small, Mid-size, Large] availability per feature. */
const COMPARISON: { group: string; rows: [string, boolean[]][] }[] = [
  {
    group: "Logging & Strategies",
    rows: [
      ["Digital incident logging", [true, true, true]],
      ["AI strategy suggestions", [true, true, true]],
      ["Teacher intervention library", [true, true, true]],
      ["Behavior pattern detection", [false, true, true]],
      ["Individual Learning Plans (ILP)", [false, true, true]],
    ],
  },
  {
    group: "Reporting",
    rows: [
      ["Standard daily reports", [true, true, true]],
      ["Advanced behavior analytics", [false, true, true]],
      ["Multi-campus aggregated data", [false, true, true]],
      ["Custom SQL data exports", [false, false, true]],
    ],
  },
  {
    group: "Compliance & Safeguarding",
    rows: [
      ["Safeguarding triage workflow", [true, true, true]],
      ["Audit trail logs", [true, true, true]],
      ["Compliant data storage (AU-East)", [true, true, true]],
    ],
  },
  {
    group: "Collaboration",
    rows: [
      ["Parent portal access", [true, true, true]],
      ["Specialist review queue", [false, true, true]],
      ["White-labeled portal", [false, false, true]],
    ],
  },
  {
    group: "Support & Onboarding",
    rows: [
      ["Self-service knowledge base", [true, true, true]],
      ["Phone & Chat support", [false, true, true]],
      ["Dedicated Success Manager", [false, false, true]],
    ],
  },
];

const FAQS = [
  {
    q: "How does the trial work?",
    a: "Schools get a 60-90 day pilot at no cost, with full access to the plan you're evaluating. Parents get a 7-day free trial. No card is charged until the trial ends.",
  },
  {
    q: "Can we upgrade or downgrade?",
    a: "Yes, at any time. Changes take effect from your next billing period and we pro-rate the difference — your data and history carry across untouched.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Credit card, direct debit and school purchase orders with invoicing. Enterprise plans can be billed annually against a PO.",
  },
  {
    q: "Do you offer refunds?",
    a: "If InsightED isn't working for your school within the first 30 days of a paid term, we'll refund it in full.",
  },
  {
    q: "Is GST included?",
    a: "Prices shown exclude GST. Australian schools and families will see GST added at checkout on the tax invoice.",
  },
  {
    q: "What happens if my school grows mid-year?",
    a: "Nothing breaks. We'll move you to the right tier at your next renewal rather than mid-term, so your budget stays predictable.",
  },
];

export default function PricingPage() {
  const [audience, setAudience] = useState<"schools" | "parents">("schools");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const tiers = audience === "schools" ? SCHOOL_TIERS : PARENT_TIERS;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-white px-6 pb-12 pt-16 md:px-20 md:pt-20">
        <div className="mx-auto flex max-w-shell flex-col items-center gap-6 text-center">
          <h1 className="text-[34px] font-bold leading-[1.1] tracking-[-1.2px] text-ink md:text-5xl">
            Pricing that fits your role
          </h1>
          <p className="text-base leading-6 text-muted">
            Simple Australian-dollar pricing. Annual savings. No hidden fees.
          </p>

          <div
            role="tablist"
            aria-label="Audience"
            className="flex gap-1 rounded-full bg-mist p-1"
          >
            {(
              [
                ["schools", "For Schools"],
                ["parents", "For Parents"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={audience === key}
                onClick={() => setAudience(key)}
                className={[
                  "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
                  audience === key
                    ? "bg-[#DBEAFE] text-brand"
                    : "text-muted hover:text-ink",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="flex flex-wrap items-center justify-center gap-2 text-xs leading-5 text-muted">
            <span>🇦🇺 Showing prices in AUD</span>
            <span aria-hidden className="text-line-strong">
              |
            </span>
            <button type="button" className="underline hover:text-brand">
              change currency
            </button>
          </p>
        </div>
      </section>

      {/* ── Plans ────────────────────────────────────────────── */}
      <section className="bg-white px-6 pb-20 md:px-20">
        <div className="mx-auto flex max-w-shell flex-col gap-10">
          <div className="flex flex-col gap-2 text-center">
            <h2 className="text-3xl font-bold leading-10 tracking-[-1px] text-ink">
              {audience === "schools"
                ? "School subscriptions"
                : "Family subscriptions"}
            </h2>
            <p className="text-sm leading-5 text-muted">
              {audience === "schools"
                ? "Annual contracts. Pilot programs available."
                : "Monthly billing. Cancel anytime."}
            </p>
          </div>

          <div
            className={[
              "mx-auto grid w-full items-start gap-8",
              audience === "schools"
                ? "lg:grid-cols-3"
                : "max-w-4xl md:grid-cols-2",
            ].join(" ")}
          >
            {tiers.map((t) => (
              <article
                key={t.name}
                className={[
                  "relative flex flex-col rounded-2xl bg-white p-8",
                  t.featured
                    ? "border-2 border-brand shadow-card lg:-my-4"
                    : "border border-line-edge",
                ].join(" ")}
              >
                {t.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-4 py-1 text-[10px] font-bold uppercase leading-[15px] tracking-[0.5px] text-white">
                    Most Popular
                  </span>
                )}

                <h3 className="text-lg font-bold leading-7 text-ink">
                  {t.name}
                </h3>
                <p className="pt-1 text-xs leading-4 text-footext">{t.scale}</p>

                <p className="flex items-baseline gap-1.5 pt-5">
                  <span className="text-4xl font-bold leading-10 text-ink">
                    {t.price}
                  </span>
                  {t.period && (
                    <span className="text-sm font-medium text-muted">
                      {t.period}
                    </span>
                  )}
                </p>
                <p className="pt-1.5 text-xs leading-4 text-footext">
                  {t.annual}
                </p>

                {t.inheritLabel && (
                  <p className="pt-6 text-[11px] font-bold uppercase leading-4 tracking-[0.55px] text-brand">
                    {t.inheritLabel}
                  </p>
                )}

                <ul
                  className={`flex flex-1 flex-col gap-3 pb-8 ${t.inheritLabel ? "pt-3" : "pt-6"}`}
                >
                  {t.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-[13px] leading-5 text-body"
                    >
                      <span className="mt-0.5 size-3.5 shrink-0 overflow-clip">
                        <img
                          src={iconCheck}
                          alt=""
                          aria-hidden
                          className="size-full"
                        />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/signup"
                  className={[
                    "flex h-12 items-center justify-center rounded-lg text-sm font-bold transition-colors",
                    t.featured
                      ? "bg-brand text-white hover:bg-[#255d99]"
                      : "border border-line-edge bg-white text-brand hover:bg-mist",
                  ].join(" ")}
                >
                  {t.cta}
                </Link>
              </article>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {HIGHLIGHTS.map((h) => (
              <div
                key={h.title}
                className="flex items-center gap-4 rounded-xl border border-line-edge bg-white px-6 py-5"
              >
                <span className="size-5 shrink-0 overflow-clip">
                  <img src={h.icon} alt="" aria-hidden className="size-full" />
                </span>
                <span>
                  <span className="block text-sm font-bold leading-5 text-ink">
                    {h.title}
                  </span>
                  <span className="block text-xs leading-4 text-muted">
                    {h.body}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Compare features ─────────────────────────────────── */}
      <section className="bg-panel px-6 py-20 md:px-20">
        <div className="mx-auto flex max-w-shell flex-col gap-10">
          <h2 className="text-center text-3xl font-bold leading-10 tracking-[-1px] text-ink">
            Compare features
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-line-edge bg-white">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="bg-mist">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase leading-4 tracking-[0.55px] text-muted">
                    Feature
                  </th>
                  {["Small", "Mid-size", "Large"].map((c) => (
                    <th
                      key={c}
                      className="px-6 py-4 text-center text-[11px] font-bold uppercase leading-4 tracking-[0.55px] text-muted"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((section) => (
                  <Fragment key={section.group}>
                    <tr className="bg-teal-tint">
                      <th
                        colSpan={4}
                        scope="colgroup"
                        className="px-6 py-2.5 text-left text-[11px] font-bold uppercase leading-4 tracking-[0.55px] text-teal"
                      >
                        {section.group}
                      </th>
                    </tr>
                    {section.rows.map(([label, marks]) => (
                      <tr
                        key={label}
                        className="border-t border-line-soft last:border-b-0"
                      >
                        <th
                          scope="row"
                          className="px-6 py-3.5 text-left text-[13px] font-normal leading-5 text-body"
                        >
                          {label}
                        </th>
                        {marks.map((on, i) => (
                          <td key={i} className="px-6 py-3.5 text-center">
                            {on ? (
                              <span className="mx-auto block size-4 overflow-clip">
                                <img
                                  src={iconCheck}
                                  alt="Included"
                                  className="size-full"
                                />
                              </span>
                            ) : (
                              <span className="text-line-strong">
                                <span className="sr-only">Not included</span>
                                <span aria-hidden>—</span>
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="bg-white px-6 py-20 md:px-20">
        <div className="mx-auto flex max-w-[820px] flex-col gap-8">
          <h2 className="text-center text-3xl font-bold leading-10 tracking-[-1px] text-ink">
            Frequently asked questions
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
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-semibold leading-5 text-ink transition-colors hover:bg-mist"
                    >
                      {f.q}
                      <span aria-hidden className="shrink-0 text-lg text-brand">
                        {open ? "−" : "+"}
                      </span>
                    </button>
                  </h3>
                  {open && (
                    <p className="px-6 pb-5 text-[13px] leading-[21px] text-body">
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
