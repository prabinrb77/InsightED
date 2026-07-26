import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import TrustBar from "../components/TrustBar";
import iconEfficiency from "../assets/icons/schools-efficiency.svg";
import iconCompliance from "../assets/icons/schools-compliance.svg";
import iconOutcomes from "../assets/icons/schools-outcomes.svg";
import arrowRight from "../assets/icons/arrow-right-white.svg";
import dashboardChart from "../assets/icons/schools-dashboard-chart.png";

/** Figma: node 264:1861 "P-002 For Schools" */

const BENEFITS = [
  {
    icon: iconEfficiency,
    chip: "bg-teal-tint",
    title: "Operational Efficiency",
    body: "Reduce administrative overhead by up to 40%. Centralise neurodiversity data and generate IEPs in minutes, not hours.",
  },
  {
    icon: iconCompliance,
    chip: "bg-[#FFFBEB]",
    title: "Compliance & Safeguarding",
    body: "Automated audit trails and role-based access control ensure your school exceeds Department of Education standards.",
  },
  {
    icon: iconOutcomes,
    chip: "bg-[#FAF5FF]",
    title: "Measurable Outcomes",
    body: "Track student progress with robust data analytics. Prove the impact of intervention strategies with longitudinal reporting.",
  },
];

const TIERS = [
  {
    name: "Small Schools",
    price: "$2,400",
    period: "/term",
    scale: "Up to 250 students",
    features: [
      "Basic IEP generator",
      "Parent Portal access",
      "Secure data hosting",
      "Email support (48hr)",
    ],
    cta: "Select Plan",
    featured: false,
  },
  {
    name: "Mid-size Schools",
    price: "$5,800",
    period: "/term",
    scale: "250 - 800 students",
    features: [
      "Advanced AI strategies",
      "Unlimited teacher logins",
      "Full compliance suite",
      "Priority phone support",
      "Staff training session",
    ],
    cta: "Select Plan",
    featured: true,
  },
  {
    name: "Large Schools",
    price: "Custom",
    period: "",
    scale: "800+ students or Multi-campus",
    features: [
      "LMS & SIS Integration",
      "SSO (SAML/Azure AD)",
      "Custom data residency",
      "Dedicated Account Manager",
    ],
    cta: "Contact Enterprise",
    featured: false,
  },
];

const ROLES = [
  "Principal / Leadership",
  "Deputy / Head of Wellbeing",
  "Learning Support Coordinator",
  "Business Manager",
  "Teacher",
];
const SIZES = ["Under 250", "250 - 800", "800+", "Multi-campus"];
const STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

const FIELD =
  "h-[42px] w-full rounded-md border border-line-edge bg-white px-3 text-sm text-ink placeholder:text-footext focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
const LABEL =
  "pb-1.5 text-[11px] font-bold uppercase leading-4 tracking-[0.55px] text-subtle";

export default function ForSchoolsPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // No backend for pilot requests yet — acknowledge instead of failing silently.
    setSubmitted(true);
  }

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="border-b border-mist bg-white px-6 py-16 md:px-20 md:py-20">
        <div className="mx-auto grid max-w-shell items-center gap-12 px-6 lg:grid-cols-2">
          <div className="flex flex-col items-start">
            <span className="rounded-full border border-teal-border bg-teal-tint px-3 py-1 text-[11px] font-bold uppercase leading-[16.5px] tracking-[1.1px] text-brand">
              For School Leaders
            </span>

            <h1 className="pt-6 text-[34px] font-bold leading-[1.1] tracking-[-1.2px] text-ink md:text-5xl md:leading-[52.8px]">
              Institution-grade
              <br />
              neurodiversity support
            </h1>

            <p className="max-w-[558px] pt-6 text-lg leading-[29.25px] text-body">
              Implement evidence-based strategies across your entire campus.
              Fully APP compliant, Australian-hosted, and designed to reduce
              teacher workload while improving student outcomes.
            </p>

            <div className="flex flex-wrap gap-4 pt-8">
              <a
                href="#pilot"
                className="flex items-center gap-3 whitespace-nowrap rounded-md bg-brand px-6 py-[17px] text-base font-bold text-white shadow-[0px_10px_15px_-3px_rgba(45,106,106,0.2),0px_4px_6px_-4px_rgba(45,106,106,0.2)] transition-colors hover:bg-[#255d99]"
              >
                Request a Pilot (60-90 days)
                <span className="h-[10px] w-[11.72px] overflow-clip">
                  <img src={arrowRight} alt="" aria-hidden className="size-full" />
                </span>
              </a>
              <button
                type="button"
                className="whitespace-nowrap rounded-md border border-[#99F6E4] bg-white px-6 py-4 text-base font-bold text-brand transition-colors hover:bg-teal-tint"
              >
                Download Brochure (PDF)
              </button>
            </div>
          </div>

          {/* Product mockup */}
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[620px]">
              <div className="flex h-[400px] overflow-clip rounded-xl border border-line-edge bg-white shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]">
                <div className="hidden w-48 shrink-0 flex-col gap-4 border-r border-line-soft bg-mist p-4 sm:flex">
                  <div className="h-4 w-[106px] rounded bg-line-edge" />
                  <div className="flex flex-col gap-2">
                    <div className="h-8 rounded border border-line-soft bg-white" />
                    <div className="h-8 rounded border border-line-soft bg-white" />
                    <div className="h-8 rounded border border-[rgba(45,106,106,0.2)] bg-[rgba(45,106,106,0.1)]" />
                    <div className="h-8 rounded border border-line-soft bg-white" />
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-6 p-6">
                  <div className="flex gap-4">
                    {[
                      { label: "Active IEPs", value: "142" },
                      { label: "Compliance Score", value: "98%" },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="flex flex-1 flex-col gap-1 rounded-lg border border-line-soft bg-mist p-4"
                      >
                        <p className="text-[10px] font-bold uppercase leading-[15px] text-footext">
                          {s.label}
                        </p>
                        <p className="text-2xl font-bold leading-8 text-brand">
                          {s.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <img
                    src={dashboardChart}
                    alt=""
                    aria-hidden
                    className="h-[200px] w-full object-contain"
                  />
                </div>
              </div>

              <div className="absolute -bottom-6 left-4 flex items-center gap-3 rounded-lg border border-line-soft bg-white px-4 py-3 shadow-card">
                <span
                  aria-hidden
                  className="flex size-6 items-center justify-center rounded-full bg-[#DCFCE7] text-xs text-teal"
                >
                  ✓
                </span>
                <span>
                  <span className="block text-[11px] font-bold leading-4 text-ink">
                    Compliance Audit
                  </span>
                  <span className="block text-[10px] leading-[15px] text-muted">
                    Verified 2m ago
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TrustBar />

      {/* ── Why schools choose InsightED ─────────────────────── */}
      <section className="bg-white px-6 py-24 md:px-20">
        <div className="mx-auto flex max-w-shell flex-col gap-16 px-6">
          <h2 className="text-center text-4xl font-bold leading-10 text-ink">
            Why schools choose InsightED
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <article
                key={b.title}
                className="flex flex-col items-start gap-4 rounded-card border border-line-edge bg-white p-8"
              >
                <div
                  className={`flex size-12 items-center justify-center rounded-chip ${b.chip}`}
                >
                  <span className="size-6 overflow-clip">
                    <img src={b.icon} alt="" aria-hidden className="size-full" />
                  </span>
                </div>
                <h3 className="text-xl font-bold leading-7 text-ink">
                  {b.title}
                </h3>
                <p className="text-[14px] leading-[22.75px] text-muted">
                  {b.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section className="bg-panel px-6 py-24 md:px-20">
        <div className="mx-auto flex max-w-shell flex-col gap-12 px-6">
          <div className="flex flex-col gap-4 text-center">
            <h2 className="text-4xl font-bold leading-10 text-ink">
              Pricing scaled to your school
            </h2>
            <p className="text-lg font-medium uppercase leading-7 tracking-[0.9px] text-body">
              Annual subscription. Australian dollars.
            </p>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-3">
            {TIERS.map((t) => (
              <article
                key={t.name}
                className={[
                  "relative flex flex-col rounded-card p-10",
                  t.featured
                    ? "bg-brand shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] lg:-my-4"
                    : "border border-line-edge bg-white",
                ].join(" ")}
              >
                {t.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FF8A65] px-4 py-1 text-[10.5px] font-bold uppercase leading-[15.75px] tracking-[0.5px] text-white">
                    Recommended
                  </span>
                )}

                <h3
                  className={[
                    "text-lg font-bold leading-7",
                    t.featured ? "text-white" : "text-muted",
                  ].join(" ")}
                >
                  {t.name}
                </h3>

                <p className="flex items-baseline gap-1 pt-2">
                  <span
                    className={[
                      "text-4xl font-bold leading-10",
                      t.featured ? "text-white" : "text-ink",
                    ].join(" ")}
                  >
                    {t.price}
                  </span>
                  {t.period && (
                    <span
                      className={[
                        "text-base font-medium leading-6",
                        t.featured ? "text-white/80" : "text-muted",
                      ].join(" ")}
                    >
                      {t.period}
                    </span>
                  )}
                </p>

                <p
                  className={[
                    "pt-2 text-sm leading-5",
                    t.featured ? "text-white/70" : "text-footext",
                  ].join(" ")}
                >
                  {t.scale}
                </p>

                <ul className="flex flex-1 flex-col gap-4 py-8">
                  {t.features.map((f) => (
                    <li
                      key={f}
                      className={[
                        "flex items-start gap-2.5 text-sm leading-5",
                        t.featured ? "text-white" : "text-body",
                      ].join(" ")}
                    >
                      <span
                        aria-hidden
                        className={t.featured ? "text-white" : "text-teal"}
                      >
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/signup"
                  className={[
                    "flex h-12 items-center justify-center rounded-md text-base font-bold transition-colors",
                    t.featured
                      ? "bg-white text-brand hover:bg-page"
                      : "border border-line-edge bg-white text-brand hover:bg-mist",
                  ].join(" ")}
                >
                  {t.cta}
                </Link>
              </article>
            ))}
          </div>

          <p className="flex flex-wrap items-center justify-center gap-1.5 text-sm leading-5 text-muted">
            <span aria-hidden>ⓘ</span>
            Regional and low-SES schools are eligible for up to 30% discount.
            <a href="#pilot" className="underline hover:text-brand">
              Apply for relief.
            </a>
          </p>
        </div>
      </section>

      {/* ── Pilot request form ───────────────────────────────── */}
      <section id="pilot" className="bg-white px-6 py-24 md:px-20">
        <div className="mx-auto max-w-[720px]">
          <div className="rounded-card border border-line-edge bg-white p-8 shadow-card md:p-12">
            <div className="flex flex-col gap-2 pb-8 text-center">
              <h2 className="text-3xl font-bold leading-9 text-ink">
                Request a pilot for your school
              </h2>
              <p className="text-[15px] leading-6 text-muted">
                Submit your details and a specialist will contact you within 24
                hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col">
                  <span className={LABEL}>School Name</span>
                  <input
                    required
                    className={FIELD}
                    placeholder="Enter school name"
                  />
                </label>
                <label className="flex flex-col">
                  <span className={LABEL}>ABN / CRICOS</span>
                  <input className={FIELD} placeholder="12 345 678 910" />
                </label>
                <label className="flex flex-col">
                  <span className={LABEL}>Contact Name</span>
                  <input required className={FIELD} placeholder="Full name" />
                </label>
                <label className="flex flex-col">
                  <span className={LABEL}>Role</span>
                  <select className={FIELD} defaultValue={ROLES[0]}>
                    {ROLES.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col">
                  <span className={LABEL}>School Email</span>
                  <input
                    required
                    type="email"
                    className={FIELD}
                    placeholder="name@school.edu.au"
                  />
                </label>
                <label className="flex flex-col">
                  <span className={LABEL}>Phone</span>
                  <input
                    type="tel"
                    className={FIELD}
                    placeholder="02 1234 5678"
                  />
                </label>
                <label className="flex flex-col">
                  <span className={LABEL}>Number of Students</span>
                  <select className={FIELD} defaultValue={SIZES[0]}>
                    {SIZES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col">
                  <span className={LABEL}>State</span>
                  <select className={FIELD} defaultValue={STATES[0]}>
                    {STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="flex flex-col">
                <span className={LABEL}>Why are you interested in a pilot?</span>
                <textarea
                  rows={4}
                  className="w-full rounded-md border border-line-edge bg-white px-3 py-2.5 text-sm text-ink placeholder:text-footext focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  placeholder="Briefly describe your school's current neurodiversity support goals..."
                />
              </label>

              <label className="flex flex-col">
                <span className={LABEL}>Preferred Start Date</span>
                <input type="date" className={FIELD} />
              </label>

              {submitted && (
                <p
                  role="status"
                  className="rounded-lg border border-teal-border bg-teal-tint px-4 py-3 text-sm leading-5 text-teal"
                >
                  Thanks — pilot requests aren't being taken yet. We'll open
                  them alongside the InsightED launch.
                </p>
              )}

              <button
                type="submit"
                className="flex h-12 items-center justify-center rounded-md bg-brand text-base font-bold text-white shadow-btn transition-colors hover:bg-[#255d99]"
              >
                Submit Pilot Request
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
