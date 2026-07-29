import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addStudent } from "../../lib/educatorStore";

/** Figma: node 301:2163 "Add a new student" */

const FIELD =
  "h-11 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink placeholder:text-footext focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
const AREA =
  "w-full rounded-lg border border-line bg-white p-3 text-sm text-ink placeholder:text-footext focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
const LABEL = "block pb-1.5 text-xs font-medium text-subtle";

function Section({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-white">
      <h2 className="flex items-center gap-2 border-b border-line px-6 py-4 text-sm font-bold text-ink">
        <span aria-hidden className="text-brand">
          {icon}
        </span>
        {title}
      </h2>
      <div className="p-6">{children}</div>
    </section>
  );
}

function Req() {
  return (
    <span aria-hidden className="text-red-500">
      *
    </span>
  );
}

export default function AddStudentPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data = new FormData(e.currentTarget as HTMLFormElement);
    const student = addStudent({
      first: String(data.get("first")),
      last: String(data.get("last")),
      grade: String(data.get("group") || "Grade 4"),
      guardian: String(data.get("contact") || "Not provided"),
    });
    setSaved(true);
    window.setTimeout(() => navigate(`/app/students/${student.id}`), 500);
  }

  return (
    <form onSubmit={handleSubmit} className="pb-28">
      <div className="px-4 py-6 md:px-8">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-xs text-muted">
            <li>
              <Link to="/app/students" className="hover:text-brand">
                My Students
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li className="font-semibold text-ink">Add Student</li>
          </ol>
        </nav>

        <h1 className="pt-2 text-2xl font-bold tracking-[-0.4px] text-ink">
          Add a new student
        </h1>
        <p className="pt-1 text-xs text-muted">
          Most fields are optional. You can complete more details later.
        </p>

        <div className="mx-auto flex max-w-[720px] flex-col gap-6 pt-6">
          <Section icon="★" title="Required Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL} htmlFor="first">
                  First Name <Req />
                </label>
                <input id="first" name="first" required placeholder="e.g. James" className={FIELD} />
              </div>
              <div>
                <label className={LABEL} htmlFor="last">
                  Last Name <Req />
                </label>
                <input id="last" name="last" required placeholder="e.g. Miller" className={FIELD} />
              </div>

              <div>
                <div className="flex items-center justify-between pb-1.5">
                  <label className="text-xs font-medium text-subtle" htmlFor="dob">
                    Date of Birth <Req />
                  </label>
                  <span className="flex gap-1">
                    <span className="rounded bg-mist px-2 py-0.5 text-[10px] font-semibold text-slate">
                      Date
                    </span>
                    <span className="rounded bg-mist px-2 py-0.5 text-[10px] font-semibold text-slate">
                      Age
                    </span>
                  </span>
                </div>
                <input id="dob" name="dob" type="date" required className={FIELD} />
              </div>
              <div>
                <label className={LABEL} htmlFor="group">
                  Class / Group
                </label>
                <select id="group" name="group" className={FIELD} defaultValue="">
                  <option value="">Select group...</option>
                  <option>Class 3</option>
                  <option>Class 4</option>
                  <option>Grade 4 — Room 204</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={LABEL} htmlFor="teacher">
                  Assigned Teacher
                </label>
                <select id="teacher" className={FIELD} defaultValue="Dr. Sarah Wilson">
                  <option>Dr. Sarah Wilson</option>
                  <option>Sarah Jenkins</option>
                  <option>David Chen</option>
                </select>
              </div>
            </div>
          </Section>

          <Section icon="📞" title="Emergency Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={LABEL} htmlFor="contact">
                  Contact Full Name
                </label>
                <input id="contact" name="contact" placeholder="e.g. Robert Miller" className={FIELD} />
              </div>

              <div>
                <label className={LABEL} htmlFor="phone">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <select aria-label="Country code" className={`${FIELD} w-24 shrink-0`} defaultValue="+61">
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+64">🇳🇿 +64</option>
                  </select>
                  <input id="phone" type="tel" placeholder="412 345 678" className={FIELD} />
                </div>
              </div>
              <div>
                <label className={LABEL} htmlFor="rel">
                  Relationship
                </label>
                <select id="rel" className={FIELD} defaultValue="">
                  <option value="">Select relationship...</option>
                  <option>Mother</option>
                  <option>Father</option>
                  <option>Guardian</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </Section>

          <Section icon="👤" title="Profile Details">
            <div className="flex flex-wrap items-center gap-5 pb-6">
              <span
                aria-hidden
                className="flex size-16 flex-col items-center justify-center rounded-full bg-mist text-[8px] font-bold uppercase tracking-[0.4px] text-muted"
              >
                <span className="text-lg">📷</span>
                Add photo
              </span>
              <div>
                <p className="text-xs font-semibold text-ink">Student Photo</p>
                <p className="pt-0.5 text-[11px] text-muted">
                  Upload a clear front-facing photo. JPG or PNG, max 5MB.
                </p>
                <label className="mt-2 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:bg-mist">
                  ⭱ Choose File
                  <input type="file" accept="image/*" className="sr-only" />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className={LABEL} htmlFor="profile">
                  Neurodevelopment Profile
                </label>
                <select id="profile" className={FIELD} defaultValue="">
                  <option value="">Select profile type...</option>
                  <option>Autism spectrum</option>
                  <option>ADHD</option>
                  <option>Dyslexia</option>
                  <option>Not specified</option>
                </select>
              </div>

              <div>
                <label className={LABEL} htmlFor="clinical">
                  Clinical Diagnosis &amp; Medical History
                </label>
                <p className="mb-2 flex gap-2 rounded-lg border border-teal-border bg-teal-tint px-3 py-2.5 text-[11px] leading-4">
                  <span aria-hidden className="text-brand">
                    ⓘ
                  </span>
                  <span>
                    <strong className="block font-semibold text-brand">
                      Confidential Information
                    </strong>
                    <span className="text-teal">
                      Information provided here is only visible to authorized
                      educators and clinical staff with 'High Level' clearance.
                    </span>
                  </span>
                </p>
                <textarea
                  id="clinical"
                  rows={3}
                  placeholder="Enter relevant medical or clinical diagnoses..."
                  className={AREA}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL} htmlFor="strengths">
                    Key Strengths
                  </label>
                  <textarea
                    id="strengths"
                    rows={4}
                    placeholder="What does this student excel at?..."
                    className={AREA}
                  />
                </div>
                <div>
                  <label className={LABEL} htmlFor="focus">
                    Behaviour Focus Areas
                  </label>
                  <textarea
                    id="focus"
                    rows={4}
                    placeholder="Areas requiring additional support?..."
                    className={AREA}
                  />
                </div>
              </div>

              <div>
                <label className={LABEL} htmlFor="notes">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  rows={2}
                  placeholder="Any other information educators should know?"
                  className={AREA}
                />
              </div>
            </div>
          </Section>

          <Section icon="🛡" title="Governance &amp; Consent">
            <div className="flex flex-wrap items-center gap-4 rounded-lg bg-mist p-4">
              <span className="rounded-full bg-[#FEE2E2] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.5px] text-[#B91C1C]">
                Not yet granted
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-ink">
                  Parent/Guardian Digital Consent
                </p>
                <p className="text-[11px] text-muted">
                  Required before creating IEP or tracking goals.
                </p>
              </div>
              <button
                type="button"
                className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink hover:bg-line-soft"
              >
                ➤ Send Consent Request
              </button>
            </div>

            <label className="flex items-center justify-between gap-4 pt-5">
              <span>
                <span className="block text-xs font-semibold text-ink">
                  Research &amp; Data Opt-in
                </span>
                <span className="block text-[11px] text-muted">
                  Allow anonymized student data to be used for educational
                  research and AI improvement.
                </span>
              </span>
              <input type="checkbox" className="size-5 shrink-0 accent-brand" />
            </label>
          </Section>

          {saved && (
            <p
              role="status"
              className="rounded-lg border border-teal-border bg-teal-tint px-4 py-3 text-sm text-teal"
            >
              Student saved. Opening the new profile…
            </p>
          )}
        </div>
      </div>

      {/* ── Sticky action bar ────────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white px-4 py-3 md:pl-[248px] md:pr-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[11px] text-muted">
            <span aria-hidden className="text-brand">
              ☁
            </span>
            Draft auto-saved 2 mins ago
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/app/students")}
              className="flex h-10 items-center rounded-lg px-4 text-sm font-semibold text-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex h-10 items-center rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-mist"
            >
              Save &amp; Add Another
            </button>
            <button
              type="submit"
              className="flex h-10 items-center rounded-lg bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-[#255d99]"
            >
              Save Student
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
