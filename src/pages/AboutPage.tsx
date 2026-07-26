import missionIllustration from "../assets/about/mission-illustration.jpg";
import teamOkafor from "../assets/about/team-okafor.jpg";
import teamSharma from "../assets/about/team-sharma.jpg";
import teamReid from "../assets/about/team-reid.jpg";
import advTran from "../assets/about/adv-tran.jpg";
import advMehta from "../assets/about/adv-mehta.jpg";
import advChen from "../assets/about/adv-chen.jpg";
import advWilson from "../assets/about/adv-wilson.jpg";
import advRodriguez from "../assets/about/adv-rodriguez.jpg";
import valueStrength from "../assets/about/value-strength.svg";
import valuePrivacy from "../assets/about/value-privacy.svg";
import valueEvidence from "../assets/about/value-evidence.svg";
import valueEducators from "../assets/about/value-educators.svg";
import iconLinkedin from "../assets/about/icon-linkedin.svg";
import award1 from "../assets/about/award-1.svg";
import award2 from "../assets/about/award-2.svg";
import award3 from "../assets/about/award-3.svg";
import award4 from "../assets/about/award-4.svg";
import award5 from "../assets/about/award-5.svg";
import award6 from "../assets/about/award-6.svg";

/** Figma: node 260:3600 "P-008 About" */

const VALUES = [
  {
    icon: valueStrength,
    title: "Strength-based always",
    body: "We focus on what students can do, not just their challenges, building confidence through success.",
  },
  {
    icon: valuePrivacy,
    title: "Privacy is non-negotiable",
    body: "Sensitive student data is protected with enterprise-grade security and Australian compliance.",
  },
  {
    icon: valueEvidence,
    title: "Evidence over hype",
    body: "Every tool and strategy in our platform is backed by peer-reviewed pedagogical research.",
  },
  {
    icon: valueEducators,
    title: "Educators are heroes",
    body: "We build for the reality of the classroom, making the teacher's day easier and more impactful.",
  },
];

const TEAM = [
  {
    photo: null,
    name: "Sarah Mitchell",
    role: "CEO & Founder",
    bio: "Former special education lead with 15 years experience in inclusive curriculum design.",
  },
  {
    photo: teamOkafor,
    name: "Dr. James Okafor",
    role: "Chief Specialist Officer",
    bio: "Clinical psychologist specializing in neuro-developmental pedagogy and assessment.",
  },
  {
    photo: teamSharma,
    name: "Priya Sharma",
    role: "Head of Product",
    bio: "Tech veteran focused on human-centered design for accessibility and educational equity.",
  },
  {
    photo: teamReid,
    name: "Marcus Reid",
    role: "Head of Engineering",
    bio: "System architect with a passion for building secure, scalable education infrastructure.",
  },
];

const ADVISORS = [
  { photo: advTran, name: "Prof. Helen Tran", role: "Ed Psychology, UNSW" },
  { photo: advMehta, name: "Dr. Anand Mehta", role: "Pediatric Neurology" },
  { photo: advChen, name: "Dr. Sarah Chen", role: "Autism Research Center" },
  { photo: advWilson, name: "James Wilson", role: "Inclusive Ed Policy" },
  {
    photo: advRodriguez,
    name: "Elena Rodriguez",
    role: "Speech Pathology Dr.",
  },
  { photo: teamReid, name: "Thomas Kim", role: "Assistive Tech Expert" },
];

const AWARDS = [
  { icon: award1, label: "Award 1" },
  { icon: award2, label: "Award 2" },
  { icon: award3, label: "Award 3" },
  { icon: award4, label: "Award 4" },
  { icon: award5, label: "Award 5" },
  { icon: award6, label: "Award 6" },
];

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-clip bg-teal-tint px-6 py-20 md:px-20">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 size-[420px] rounded-[50%_50%_0_50%] bg-white/40"
        />
        <div className="relative mx-auto flex max-w-shell flex-col items-center gap-5 text-center">
          <span className="text-[11px] font-bold uppercase leading-[16.5px] tracking-[1.1px] text-teal">
            About Special Miles
          </span>
          <h1 className="max-w-3xl text-[32px] font-bold leading-[1.15] tracking-[-1px] text-ink md:text-[40px] md:leading-[48px]">
            Built by educators. Guided by neurodivergent voices.
          </h1>
          <p className="max-w-2xl text-base leading-[26px] text-body">
            Special Miles is an Australian education technology company building
            tools that make every classroom and every home a place where
            neurodivergent learners thrive.
          </p>
        </div>
      </section>

      {/* ── Our mission ──────────────────────────────────────── */}
      <section className="bg-white px-6 py-20 md:px-20">
        <div className="mx-auto grid max-w-shell items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <h2 className="text-3xl font-bold leading-9 tracking-[-0.8px] text-ink">
              Our mission
            </h2>
            <p className="text-[13px] leading-[22px] text-body">
              We believe that special education shouldn't be a separate,
              isolated track. Every student deserves access to high-quality,
              evidence-based support directly within their primary learning
              environment.
            </p>
            <p className="text-[13px] leading-[22px] text-body">
              Our platform bridges the gap between clinical intervention and
              classroom instruction, using data-driven insights to provide
              educators with actionable strategies that work for every brain
              type.
            </p>
            <p className="text-[13px] leading-[22px] text-body">
              By reducing the cognitive load on teachers and the stigma on
              students, we're creating an educational landscape where diversity
              is a celebrated strength rather than a barrier.
            </p>
          </div>

          <img
            src={missionIllustration}
            alt="Illustration of diverse students learning together in a bright modern classroom"
            className="h-[300px] w-full rounded-2xl object-cover"
          />
        </div>
      </section>

      {/* ── What we stand for ────────────────────────────────── */}
      <section className="bg-panel px-6 py-20 md:px-20">
        <div className="mx-auto flex max-w-shell flex-col gap-12">
          <h2 className="text-center text-3xl font-bold leading-9 tracking-[-0.8px] text-ink">
            What we stand for
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <article
                key={v.title}
                className="flex flex-col items-start gap-4 rounded-xl border border-line-edge bg-white p-6"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-teal-tint">
                  <span className="size-4 overflow-clip">
                    <img src={v.icon} alt="" aria-hidden className="size-full" />
                  </span>
                </span>
                <h3 className="text-base font-bold leading-6 text-ink">
                  {v.title}
                </h3>
                <p className="text-xs leading-[19px] text-muted">{v.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our team ─────────────────────────────────────────── */}
      <section className="bg-white px-6 py-20 md:px-20">
        <div className="mx-auto flex max-w-shell flex-col gap-12">
          <h2 className="text-center text-3xl font-bold leading-9 tracking-[-0.8px] text-ink">
            Our team
          </h2>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((m) => (
              <article
                key={m.name}
                className="flex flex-col items-center gap-3 text-center"
              >
                {m.photo ? (
                  <img
                    src={m.photo}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    className="size-[120px] rounded-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="flex size-[120px] items-center justify-center rounded-full bg-line-soft text-2xl font-bold text-footext"
                  >
                    {m.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </span>
                )}

                <h3 className="pt-2 text-base font-bold leading-6 text-ink">
                  {m.name}
                </h3>
                <p className="text-[11px] font-bold uppercase leading-4 tracking-[0.55px] text-amber">
                  {m.role}
                </p>
                <p className="text-xs leading-[19px] text-muted">{m.bio}</p>

                <a
                  href="#linkedin"
                  aria-label={`${m.name} on LinkedIn`}
                  className="pt-1 opacity-70 transition-opacity hover:opacity-100"
                >
                  <span className="block size-4 overflow-clip">
                    <img
                      src={iconLinkedin}
                      alt=""
                      aria-hidden
                      className="size-full"
                    />
                  </span>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Advisory board ───────────────────────────────────── */}
      <section className="bg-panel px-6 py-20 md:px-20">
        <div className="mx-auto flex max-w-shell flex-col gap-10">
          <h2 className="text-center text-3xl font-bold leading-9 tracking-[-0.8px] text-ink">
            Advisory board
          </h2>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {ADVISORS.map((a) => (
              <article
                key={a.name}
                className="flex flex-col items-center gap-2 rounded-xl border border-line-edge bg-white px-4 py-5 text-center"
              >
                <img
                  src={a.photo}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="size-12 rounded-full object-cover"
                />
                <h3 className="pt-1 text-xs font-bold leading-4 text-ink">
                  {a.name}
                </h3>
                <p className="text-[10px] leading-[15px] text-muted">
                  {a.role}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recognized by ────────────────────────────────────── */}
      <section className="bg-white px-6 py-20 md:px-20">
        <div className="mx-auto flex max-w-shell flex-col gap-10">
          <h2 className="text-center text-2xl font-bold leading-8 tracking-[-0.5px] text-ink">
            Recognized by
          </h2>

          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {AWARDS.map((a) => (
              <div
                key={a.label}
                className="flex flex-col items-center gap-2 rounded-lg border border-line-soft bg-white px-4 py-6 opacity-60"
              >
                <span className="size-6 overflow-clip">
                  <img src={a.icon} alt="" aria-hidden className="size-full" />
                </span>
                <span className="text-[10px] leading-[15px] text-footext">
                  {a.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
