/** "or continue with" divider + Google / Microsoft buttons, shared by login and signup. */

export default function SocialAuthButtons({
  onSelect,
}: {
  onSelect: (provider: "google" | "microsoft") => void;
}) {
  return (
    <>
      <div className="flex items-center gap-4" aria-hidden>
        <span className="h-px flex-1 bg-line" />
        <span className="text-[13px] font-medium text-muted">
          or continue with
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect("google")}
          className="flex h-12 items-center justify-center gap-2.5 rounded-lg border border-line bg-white text-[15px] font-semibold text-ink transition-colors hover:bg-line-soft"
        >
          <GoogleLogo />
          Google
        </button>
        <button
          type="button"
          onClick={() => onSelect("microsoft")}
          className="flex h-12 items-center justify-center gap-2.5 rounded-lg border border-line bg-white text-[15px] font-semibold text-ink transition-colors hover:bg-line-soft"
        >
          <MicrosoftLogo />
          Microsoft
        </button>
      </div>
    </>
  );
}

function GoogleLogo() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.28a7.21 7.21 0 0 1 0-4.56V6.61H1.27a12 12 0 0 0 0 10.78l4.01-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.35.61 4.59 1.8l3.44-3.44A11.98 11.98 0 0 0 1.27 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

function MicrosoftLogo() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
      <path fill="#F25022" d="M1 1h10.5v10.5H1z" />
      <path fill="#7FBA00" d="M12.5 1H23v10.5H12.5z" />
      <path fill="#00A4EF" d="M1 12.5h10.5V23H1z" />
      <path fill="#FFB900" d="M12.5 12.5H23V23H12.5z" />
    </svg>
  );
}
