import { ClipboardEvent, KeyboardEvent, useRef } from "react";

/** Six single-character boxes used by the email/SMS verification steps. */
export default function OtpInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (next: string) => void;
  label: string;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function setChar(i: number, char: string) {
    const next = value.padEnd(6, " ").split("");
    next[i] = char || " ";
    onChange(next.join("").trimEnd());
    if (char && i < 5) refs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    e.preventDefault();
    onChange(digits);
    refs.current[Math.min(digits.length, 5)]?.focus();
  }

  return (
    <fieldset className="flex justify-center gap-3">
      <legend className="sr-only">{label}</legend>
      {Array.from({ length: 6 }, (_, i) => {
        const char = value[i] ?? "";
        return (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={char.trim()}
            onChange={(e) => setChar(i, e.target.value.replace(/\D/g, "").slice(-1))}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${i + 1}`}
            className={[
              "size-12 rounded-lg border text-center text-xl font-bold text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20",
              char.trim()
                ? "border-brand bg-white"
                : "border-authline bg-white focus:border-brand",
            ].join(" ")}
          />
        );
      })}
    </fieldset>
  );
}
