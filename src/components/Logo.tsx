import { Link } from "react-router-dom";
import mark from "../assets/brand/mizanova-mark.png";

/**
 * The MiZanova lockup: brain mark + wordmark.
 *
 * The mark's artwork is transparent where the source PNG was white, so on dark
 * surfaces it needs the white chip (`tone="light"`) rather than sitting bare —
 * otherwise the scales and circuitry punch through to the background.
 */

const SIZES = {
  sm: { mark: "h-8 w-8", text: "text-xl leading-[30px]", gap: "gap-2" },
  md: { mark: "h-9 w-9", text: "text-2xl leading-8", gap: "gap-2.5" },
  lg: { mark: "h-12 w-12", text: "text-3xl leading-9", gap: "gap-3" },
} as const;

type Props = {
  /** Omit to render a plain, unlinked lockup. */
  to?: string | null;
  size?: keyof typeof SIZES;
  /** "light" = white wordmark on a dark surface. */
  tone?: "dark" | "light";
  onClick?: () => void;
  className?: string;
};

export default function Logo({
  to = "/",
  size = "md",
  tone = "dark",
  onClick,
  className = "",
}: Props) {
  const s = SIZES[size];

  const content = (
    <>
      <img
        src={mark}
        alt=""
        aria-hidden
        className={[
          s.mark,
          "shrink-0 object-contain",
          tone === "light" ? "rounded-lg bg-white p-1" : "",
        ].join(" ")}
      />
      <span className={[s.text, "font-bold tracking-[-0.5px]"].join(" ")}>
        {tone === "light" ? (
          <span className="text-white">MiZanova</span>
        ) : (
          <>
            <span className="text-navy">MiZa</span>
            <span className="text-leaf">nova</span>
          </>
        )}
      </span>
    </>
  );

  const shell = ["flex items-center", s.gap, className].join(" ");

  if (!to) {
    return <span className={shell}>{content}</span>;
  }

  return (
    <Link to={to} onClick={onClick} className={shell}>
      {content}
    </Link>
  );
}
