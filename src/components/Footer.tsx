import { Link } from "react-router-dom";
import {
  iconHeart,
  iconRegion,
  iconSocial1,
  iconSocial2,
  iconSocial3,
} from "../assets/figmaAssets";

/** Figma: node 316:3267 "Footer" */

const COLUMNS: { heading: string; links: { label: string; to: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", to: "/features" },
      { label: "Security", to: "/security" },
      { label: "Pricing", to: "/pricing" },
      { label: "Changelog", to: "/changelog" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Careers", to: "/careers" },
      { label: "Blog", to: "/blog" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Cookie Policy", to: "/cookies" },
      { label: "Safeguarding", to: "/safeguarding" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Center", to: "/help" },
      { label: "Community", to: "/community" },
      { label: "Training", to: "/training" },
      { label: "Status", to: "/status" },
    ],
  },
];

const SOCIALS = [
  { src: iconSocial1, label: "InsightED on X", size: "h-[13px] w-4" },
  { src: iconSocial2, label: "InsightED on LinkedIn", size: "h-[14px] w-[14px]" },
  { src: iconSocial3, label: "InsightED on YouTube", size: "h-3 w-[17px]" },
];

export default function Footer() {
  return (
    <footer className="bg-ink px-6 pb-8 pt-20 md:px-20">
      <div className="mx-auto max-w-shell px-0 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {COLUMNS.map((col) => (
            <div key={col.heading} className="flex flex-col gap-4">
              <h2 className="text-[15px] font-semibold leading-[22.5px] text-white">
                {col.heading}
              </h2>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm leading-5 text-footext transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="flex flex-col gap-4">
            <h2 className="text-[15px] font-semibold leading-[22.5px] text-white">
              Connect
            </h2>
            <ul className="flex gap-4">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href="#"
                    aria-label={s.label}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-white/10"
                  >
                    <img src={s.src} alt="" aria-hidden className={s.size} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-bold leading-5 tracking-[-0.35px] text-white">
              InsightED
            </span>
            <span className="text-base leading-6 text-body" aria-hidden>
              |
            </span>
            <span className="text-xs leading-4 text-footext">
              © 2026 Special Miles Pty Ltd. ABN 12 345 678 901.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <span className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5">
              <img src={iconRegion} alt="" aria-hidden className="h-[13px] w-[13px]" />
              <span className="text-xs leading-4 text-footext">🇦🇺 Australia</span>
            </span>
            <span className="flex items-center gap-1 text-xs leading-4 text-footext">
              Designed with
              <img src={iconHeart} alt="" aria-hidden className="h-2 w-2.5" />
              for inclusive learning
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
