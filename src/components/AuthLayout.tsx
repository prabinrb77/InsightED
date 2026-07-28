import { ReactNode } from "react";
import Logo from "./Logo";

/**
 * Standalone auth-portal chrome. The Figma auth frames don't use the marketing
 * header/footer — they have their own slim bar and legal strip.
 *
 * `compact` matches the login frame (1:198); `portal` matches the sign-up
 * choose-path frame (186:1103), which is wider and offers support contact.
 */
export default function AuthLayout({
  children,
  variant = "compact",
}: {
  children: ReactNode;
  variant?: "compact" | "portal";
}) {
  const portal = variant === "portal";

  return (
    <div
      className={`flex min-h-screen flex-col ${portal ? "bg-panel" : "bg-page"}`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-brand"
      >
        Skip to content
      </a>

      <header
        className={[
          "flex w-full items-center border-b bg-white",
          portal
            ? "h-[72px] justify-between border-authline px-6 md:px-12"
            : "h-16 border-line px-6 md:px-8",
        ].join(" ")}
      >
        <Logo size={portal ? "md" : "sm"} />

        {portal && (
          <p className="text-sm leading-5 text-authslate">
            Need help?{" "}
            <a href="#support" className="font-medium text-brand hover:underline">
              Contact Support
            </a>
          </p>
        )}
      </header>

      <main
        id="main"
        className="flex flex-1 items-center justify-center px-4 py-16 md:py-24"
      >
        {children}
      </main>

      {portal ? (
        <footer className="flex w-full items-center justify-center border-t border-authline bg-white px-6 py-4">
          <p className="flex flex-wrap items-center justify-center gap-2 text-xs leading-[18px] text-authslate">
            <span>© 2026 MiZanova by Special Miles.</span>
            <span aria-hidden>·</span>
            <a href="#privacy" className="hover:text-brand">
              Privacy Policy
            </a>
            <span aria-hidden>·</span>
            <a href="#terms" className="hover:text-brand">
              Terms
            </a>
            <span aria-hidden>·</span>
            <a href="#accessibility" className="hover:text-brand">
              Accessibility
            </a>
          </p>
        </footer>
      ) : (
        <footer className="flex w-full flex-wrap items-center justify-between gap-3 px-6 py-6 md:px-8">
          <p className="text-xs leading-[18px] text-slate">
            © 2026 MiZanova Unified Authentication Portal
          </p>
          <div className="flex gap-6">
            <a
              href="#privacy"
              className="text-xs leading-[18px] text-slate hover:text-brand"
            >
              Privacy Policy
            </a>
            <a
              href="#help"
              className="text-xs leading-[18px] text-slate hover:text-brand"
            >
              Help Center
            </a>
          </div>
        </footer>
      )}
    </div>
  );
}
