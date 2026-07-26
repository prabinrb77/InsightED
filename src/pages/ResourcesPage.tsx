import { useMemo, useState } from "react";
import coverSensory from "../assets/resources/cover-sensory.jpg";
import coverAdhd from "../assets/resources/cover-adhd.jpg";
import coverIep from "../assets/resources/cover-iep.jpg";
import coverDyslexia from "../assets/resources/cover-dyslexia.jpg";
import coverCalmdown from "../assets/resources/cover-calmdown.jpg";
import coverStjudes from "../assets/resources/cover-stjudes.jpg";
import coverTransitions from "../assets/resources/cover-transitions.jpg";
import coverVisualaids from "../assets/resources/cover-visualaids.jpg";
import coverExecfunction from "../assets/resources/cover-execfunction.jpg";
import author1 from "../assets/resources/author-1.jpg";
import author2 from "../assets/resources/author-2.jpg";
import author3 from "../assets/resources/author-3.jpg";
import author4 from "../assets/resources/author-4.jpg";
import author5 from "../assets/resources/author-5.jpg";
import author6 from "../assets/resources/author-6.jpg";
import author7 from "../assets/resources/author-7.jpg";
import author8 from "../assets/resources/author-8.jpg";

/** Figma: node 264:4241 "P-007 Resources" */

const FILTERS = [
  "All",
  "Articles",
  "Videos",
  "Toolkits",
  "Webinars",
  "Research Papers",
  "Case Studies",
] as const;

type Filter = (typeof FILTERS)[number];

/** Badge colour per resource type, read from the Figma frame. */
const TYPE_STYLES: Record<string, string> = {
  Article: "bg-brand",
  Video: "bg-[#7C3AED]",
  Toolkit: "bg-[#EA580C]",
  Research: "bg-[#0F766E]",
  "Case Study": "bg-[#BE185D]",
  Webinar: "bg-[#B91C1C]",
};

/** Which filter chip each card type belongs to. */
const TYPE_FILTER: Record<string, Filter> = {
  Article: "Articles",
  Video: "Videos",
  Toolkit: "Toolkits",
  Research: "Research Papers",
  "Case Study": "Case Studies",
  Webinar: "Webinars",
};

const RESOURCES = [
  {
    type: "Article",
    meta: "8 min read",
    cover: coverSensory,
    title: "Understanding sensory processing in the classroom",
    excerpt:
      "Learn how to identify sensory triggers and create a classroom environment that supports sensory regulation for…",
    author: "Dr. Sarah Jenkins",
    avatar: author1,
    date: "Oct 12, 2023",
    access: "FREE",
    premium: false,
  },
  {
    type: "Video",
    meta: "45 min video",
    cover: coverAdhd,
    title: "The strengths-based approach to ADHD support",
    excerpt:
      "Moving beyond the deficit model: how to harness executive function challenges into classroom advantages.",
    author: "Marcus Chen",
    avatar: author2,
    date: "Oct 10, 2023",
    access: "PREMIUM",
    premium: true,
  },
  {
    type: "Toolkit",
    meta: "12 MB PDF",
    cover: coverIep,
    title: "How to write a neurodiversity-affirming IEP",
    excerpt:
      "A step-by-step guide with templates for crafting Individualized Education Programs that respect student…",
    author: "Elena Rodriguez",
    avatar: author3,
    date: "Oct 05, 2023",
    access: "FREE",
    premium: false,
  },
  {
    type: "Research",
    meta: "15 min read",
    cover: coverDyslexia,
    title: "Early screening for Dyslexia: Latest findings",
    excerpt:
      "Reviewing recent longitudinal studies on the impact of early identification and intervention in primary schools.",
    author: "Prof. James Wilson",
    avatar: author4,
    date: "Sep 28, 2023",
    access: "FREE",
    premium: false,
  },
  {
    type: "Article",
    meta: "6 min read",
    cover: coverCalmdown,
    title: "Creating a 'Calm Down' corner that works",
    excerpt:
      "Why some cool-down areas fail and how to design one that effectively supports student self-regulation.",
    author: "Amelia Hunt",
    avatar: author5,
    date: "Sep 22, 2023",
    access: "PREMIUM",
    premium: true,
  },
  {
    type: "Case Study",
    meta: "12 min read",
    cover: coverStjudes,
    title: "St. Jude's Academy: Scaling inclusive culture",
    excerpt:
      "How one school district implemented InsightED to support over 500 neurodivergent students across 5 campuses.",
    author: "David O'Brien",
    avatar: author6,
    date: "Sep 15, 2023",
    access: "FREE",
    premium: false,
  },
  {
    type: "Webinar",
    meta: "60 min replay",
    cover: coverTransitions,
    title: "Navigating secondary school transitions",
    excerpt:
      "Expert panel discussion on supporting neurodivergent students as they move from primary to high school.",
    author: "InsightED Panel",
    avatar: author7,
    date: "Sep 08, 2023",
    access: "FREE",
    premium: false,
  },
  {
    type: "Toolkit",
    meta: "5 MB ZIP",
    cover: coverVisualaids,
    title: "Classroom Visual Aids: Complete Set",
    excerpt:
      "Downloadable high-resolution visual schedules, emotion charts, and expectation cards for your classroom.",
    author: "Jordan Taylor",
    avatar: author8,
    date: "Sep 01, 2023",
    access: "FREE",
    premium: false,
  },
  {
    type: "Article",
    meta: "10 min read",
    cover: coverExecfunction,
    title: "Executive function strategies for high schoolers",
    excerpt:
      "Advanced planning and organization techniques specifically designed for the teenage neurodivergent brain.",
    author: "Dr. Simon Katz",
    avatar: author1,
    date: "Aug 25, 2023",
    access: "PREMIUM",
    premium: true,
  },
];

export default function ResourcesPage() {
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Newest first");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESOURCES.filter((r) => {
      const matchesFilter =
        filter === "All" || TYPE_FILTER[r.type] === filter;
      const matchesQuery =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.excerpt.toLowerCase().includes(q) ||
        r.author.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  return (
    <>
      {/* ── Hero + search ────────────────────────────────────── */}
      <section className="bg-panel px-6 py-16 md:px-20">
        <div className="mx-auto flex max-w-shell flex-col items-center gap-4 text-center">
          <h1 className="text-[32px] font-bold leading-[1.15] tracking-[-1px] text-ink md:text-4xl">
            Resources for inclusive learning
          </h1>
          <p className="text-base leading-6 text-muted">
            Articles, video courses, toolkits, and research on neurodiversity in
            education
          </p>

          <label className="relative mt-4 w-full max-w-[420px]">
            <span className="sr-only">Search resources</span>
            <span
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            >
              ⌕
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resources..."
              className="h-11 w-full rounded-lg border border-line-edge bg-white pl-10 pr-4 text-sm text-ink placeholder:text-footext focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </label>
        </div>
      </section>

      {/* ── Filters ──────────────────────────────────────────── */}
      <section className="border-b border-line-soft bg-white px-6 py-4 md:px-20">
        <div className="mx-auto flex max-w-shell flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={[
                  "rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors",
                  filter === f
                    ? "bg-brand text-white"
                    : "border border-line-edge bg-white text-body hover:bg-mist",
                ].join(" ")}
              >
                {f}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-[13px] text-muted">
            Sort:
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-line-edge bg-white px-3 py-1.5 text-[13px] font-medium text-ink focus:border-brand focus:outline-none"
            >
              <option>Newest first</option>
              <option>Oldest first</option>
              <option>Most popular</option>
            </select>
          </label>
        </div>
      </section>

      {/* ── Resource grid ────────────────────────────────────── */}
      <section className="bg-white px-6 py-12 md:px-20">
        <div className="mx-auto max-w-shell">
          {visible.length === 0 ? (
            <p className="py-16 text-center text-base text-muted">
              No resources match that search yet.
            </p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((r) => (
                <article key={r.title} className="flex flex-col gap-4">
                  <div className="relative h-[180px] overflow-clip rounded-xl bg-line-soft">
                    <img
                      src={r.cover}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      className="size-full object-cover"
                    />

                    <span
                      className={`absolute left-3 top-3 rounded px-2 py-1 text-[10px] font-bold uppercase leading-[15px] tracking-[0.5px] text-white ${TYPE_STYLES[r.type]}`}
                    >
                      {r.type}
                    </span>
                    <span className="absolute right-3 top-3 rounded bg-black/60 px-2 py-1 text-[10px] font-semibold leading-[15px] text-white">
                      {r.meta}
                    </span>

                    {r.premium && (
                      <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/45 text-white">
                        <span aria-hidden className="text-lg">
                          🔒
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-[0.55px]">
                          Premium Content
                        </span>
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg font-bold leading-6 tracking-[-0.3px] text-ink">
                    <a href="#resource" className="hover:text-brand">
                      {r.title}
                    </a>
                  </h2>
                  <p className="flex-1 text-[13px] leading-[21px] text-muted">
                    {r.excerpt}
                  </p>

                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <img
                        src={r.avatar}
                        alt=""
                        aria-hidden
                        loading="lazy"
                        className="size-6 shrink-0 rounded-full object-cover"
                      />
                      <span className="text-xs leading-4 text-muted">
                        {r.author} • {r.date}
                      </span>
                    </span>
                    <span
                      className={[
                        "rounded px-2 py-0.5 text-[10px] font-bold uppercase leading-[15px] tracking-[0.5px]",
                        r.premium
                          ? "bg-[#FFFBEB] text-amber"
                          : "bg-[#EFF6FF] text-brand",
                      ].join(" ")}
                    >
                      {r.access}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* ── Pagination ─────────────────────────────────── */}
          <nav
            aria-label="Resource pages"
            className="flex flex-col items-center gap-3 pt-14"
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous page"
                className="flex size-8 items-center justify-center rounded-md border border-line-edge bg-white text-muted transition-colors hover:bg-mist"
              >
                ‹
              </button>
              {["1", "2", "3", "4", "…", "12"].map((p, i) => (
                <button
                  key={`${p}-${i}`}
                  type="button"
                  disabled={p === "…"}
                  aria-current={p === "1" ? "page" : undefined}
                  className={[
                    "flex size-8 items-center justify-center rounded-md text-[13px] font-semibold transition-colors",
                    p === "1"
                      ? "bg-brand text-white"
                      : p === "…"
                        ? "text-muted"
                        : "border border-line-edge bg-white text-body hover:bg-mist",
                  ].join(" ")}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                aria-label="Next page"
                className="flex size-8 items-center justify-center rounded-md border border-line-edge bg-white text-muted transition-colors hover:bg-mist"
              >
                ›
              </button>
            </div>
            <p className="text-xs leading-4 text-muted">
              {visible.length} of 142 results
            </p>
          </nav>
        </div>
      </section>
    </>
  );
}
