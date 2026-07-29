import { FormEvent, useState } from "react";
import type { Student } from "../data/students";
import { addBehaviourLog } from "../lib/educatorStore";

export default function BehaviourLogModal({
  student,
  onClose,
  onSaved,
}: {
  student: Student;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [intensity, setIntensity] = useState<"Low" | "Medium" | "High">("Low");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    addBehaviourLog({
      studentId: student.id,
      behaviour: String(form.get("behaviour")),
      intensity,
      context: String(form.get("context")),
      notes: String(form.get("notes") || ""),
    });
    onSaved?.();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0F172A]/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="log-title"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-[560px] overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-line px-6 py-5">
          <div>
            <h2 id="log-title" className="text-xl font-bold text-ink">
              Log behaviour
            </h2>
            <p className="mt-1 text-sm text-muted">{student.full}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-9 items-center justify-center rounded-lg text-xl text-muted hover:bg-mist"
          >
            ×
          </button>
        </header>

        <div className="space-y-5 px-6 py-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">
              What happened?
            </span>
            <select
              name="behaviour"
              required
              className="h-11 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink"
            >
              <option>Emotional dysregulation</option>
              <option>Difficulty staying on task</option>
              <option>Social interaction conflict</option>
              <option>Positive engagement</option>
              <option>Other</option>
            </select>
          </label>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-ink">
              Intensity
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {(["Low", "Medium", "High"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setIntensity(level)}
                  className={[
                    "h-11 rounded-lg border text-sm font-semibold",
                    intensity === level
                      ? "border-brand bg-brand text-white"
                      : "border-line bg-white text-muted hover:bg-mist",
                  ].join(" ")}
                >
                  {level}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">
              Context
            </span>
            <select
              name="context"
              required
              className="h-11 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink"
            >
              <option>During classwork</option>
              <option>Group activity</option>
              <option>Transition</option>
              <option>Break or lunch</option>
              <option>Arrival or dismissal</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">
              Notes <span className="font-normal text-muted">(optional)</span>
            </span>
            <textarea
              name="notes"
              rows={4}
              placeholder="Add useful context, triggers, or supports used…"
              className="w-full resize-none rounded-lg border border-line p-3 text-sm text-ink placeholder:text-footext"
            />
          </label>
        </div>

        <footer className="flex justify-end gap-3 border-t border-line bg-mist px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink"
          >
            Cancel
          </button>
          <button className="h-10 rounded-lg bg-brand px-5 text-sm font-semibold text-white">
            Save log
          </button>
        </footer>
      </form>
    </div>
  );
}
