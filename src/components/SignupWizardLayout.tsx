import { ReactNode } from "react";
import { Link } from "react-router-dom";

/**
 * Chrome for the multi-step sign-up wizards (Figma 186:1185 … 186:1564):
 * a slim logo bar with an 8px progress rail underneath.
 */
export default function SignupWizardLayout({
  step,
  totalSteps,
  onBack,
  showSignIn = false,
  children,
}: {
  /** 1-based; pass totalSteps + 1 for the completed state. */
  step: number;
  totalSteps: number;
  onBack?: () => void;
  showSignIn?: boolean;
  children: ReactNode;
}) {
  const pct = Math.min(100, Math.round((step / totalSteps) * 100));

  return (
    <div className="flex min-h-screen flex-col bg-panel">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-brand"
      >
        Skip to content
      </a>

      <header className="flex h-[60px] shrink-0 items-center justify-between bg-white px-6 md:px-10">
        <Link
          to="/"
          className="text-2xl font-bold leading-8 tracking-[-0.6px] text-brand"
        >
          InsightED
        </Link>

        {showSignIn && (
          <p className="text-sm leading-5 text-authslate">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand hover:underline">
              Sign in
            </Link>
          </p>
        )}

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back a step"
            className="px-2 text-lg text-brand hover:opacity-70"
          >
            ‹
          </button>
        )}
      </header>

      <div
        className="h-2 w-full shrink-0 bg-[#E6E8EC]"
        role="progressbar"
        aria-valuenow={Math.min(step, totalSteps)}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Step ${Math.min(step, totalSteps)} of ${totalSteps}`}
      >
        <div
          className="h-full bg-brand transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <main
        id="main"
        className="flex flex-1 items-start justify-center px-4 py-16"
      >
        {children}
      </main>
    </div>
  );
}
