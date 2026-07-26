import { Link } from "react-router-dom";
import Avatar from "../../components/Avatar";
import { STUDENTS } from "../../data/students";

/** Figma: node 1:1370 "Student Directory" */

export default function StudentsPage() {
  const rows = STUDENTS.slice(4);

  return (
    <div className="px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.5px] text-ink">
            Student Directory
          </h1>
          <p className="pt-1 text-[15px] leading-6 text-muted">
            24 Total Students
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="flex h-11 items-center gap-2 rounded-lg border border-line bg-white px-5 text-[15px] font-semibold text-ink transition-colors hover:bg-mist"
          >
            <span aria-hidden>⭳</span>
            Export CSV
          </button>
          <Link
            to="/app/students/new"
            className="flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-[15px] font-semibold text-white transition-colors hover:bg-[#255d99]"
          >
            <span aria-hidden>＋</span>
            Add Student
          </Link>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              {["Student", "Student ID", "Primary Guardian", "Attendance %"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-[11px] font-bold uppercase leading-4 tracking-[0.6px] text-muted"
                  >
                    {h}
                  </th>
                ),
              )}
              <th className="px-6 py-4 text-right text-[11px] font-bold uppercase leading-4 tracking-[0.6px] text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-b border-line last:border-b-0">
                <th scope="row" className="px-6 py-4 text-left font-normal">
                  <span className="flex items-center gap-3">
                    <Avatar name={s.full} />
                    <span>
                      <span className="block text-sm font-bold leading-5 text-ink">
                        {s.short}
                      </span>
                      <span className="block text-xs leading-4 text-muted">
                        {s.grade}
                      </span>
                    </span>
                  </span>
                </th>
                <td className="px-6 py-4 text-sm text-body">{s.studentId}</td>
                <td className="px-6 py-4 text-sm text-body">{s.guardian}</td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="h-1.5 w-24 overflow-hidden rounded-full bg-line"
                    >
                      <span
                        className={`block h-full rounded-full ${
                          s.attendance >= 85 ? "bg-[#16A34A]" : "bg-[#EF4444]"
                        }`}
                        style={{ width: `${s.attendance}%` }}
                      />
                    </span>
                    <span className="text-sm font-bold text-ink">
                      {s.attendance}%
                    </span>
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="flex justify-end gap-2">
                    <Link
                      to={`/app/students/${s.id}`}
                      className="flex h-9 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-[#255d99]"
                    >
                      View Profile
                    </Link>
                    <button
                      type="button"
                      className="flex h-9 items-center rounded-lg border border-brand bg-white px-4 text-sm font-semibold text-brand transition-colors hover:bg-mist"
                    >
                      Quick Log
                    </button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
