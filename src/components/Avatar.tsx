/**
 * Initials avatar. The Figma app screens use photographs of students and staff;
 * we render initials instead rather than shipping stock portraits of people who
 * don't exist. Swap for real `<img>` once profile photos come from the backend.
 */

const TINTS = [
  "bg-[#DBEAFE] text-brand",
  "bg-teal-tint text-teal",
  "bg-[#FFF7ED] text-amber",
  "bg-[#FAF5FF] text-[#7C3AED]",
  "bg-[#FCE7F3] text-[#BE185D]",
];

export function initialsOf(name: string) {
  return name
    .replace(/[^A-Za-z .]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function Avatar({
  name,
  className = "size-10",
}: {
  name: string;
  className?: string;
}) {
  // Stable tint per name so a person keeps the same colour across screens.
  const tint =
    TINTS[
      Math.abs(
        [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7),
      ) % TINTS.length
    ];

  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full text-xs font-bold ${tint} ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
}
