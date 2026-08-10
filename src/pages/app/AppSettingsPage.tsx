import useSession from "../../hooks/useSession";
import { supabase } from "../../lib/supabase";
import Avatar from "../../components/Avatar";
import { useNavigate } from "react-router-dom";
import TotpMfa from "../../components/TotpMfa";

/**
 * Educator settings. The Figma file has settings frames for the parent,
 * specialist and admin apps but none for the educator, so this covers the
 * essentials in the app's own style rather than copying another role's screen.
 */
export default function AppSettingsPage() {
  const session = useSession();
  const navigate = useNavigate();
  const email = session?.user.email ?? "sarah.jenkins@school.edu.au";

  async function leave(destination: "/login" | "/") {
    if (supabase) await supabase.auth.signOut();
    navigate(destination);
  }

  return (
    <div className="px-4 py-8 md:px-8">
      <h1 className="text-3xl font-bold tracking-[-0.5px] text-ink">Settings</h1>
      <p className="pt-1 text-[15px] leading-6 text-muted">
        Manage your profile and classroom preferences.
      </p>

      <div className="mx-auto flex max-w-[720px] flex-col gap-6 pt-6">
        <section className="rounded-xl border border-line bg-white p-6">
          <h2 className="text-sm font-bold text-ink">Authenticator security</h2>
          <div className="pt-4"><TotpMfa management /></div>
        </section>

        <section className="rounded-xl border border-line bg-white p-6">
          <h2 className="text-sm font-bold text-ink">Profile</h2>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Avatar name="Sarah Jenkins" className="size-14 text-base" />
            <div className="min-w-0">
              <p className="text-base font-bold text-ink">Sarah Jenkins</p>
              <p className="truncate text-sm text-muted">{email}</p>
              <p className="pt-0.5 text-xs text-muted">
                Educator • Grade 4 • Room 204
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-line bg-white p-6">
          <h2 className="text-sm font-bold text-ink">Notifications</h2>
          <ul className="flex flex-col gap-4 pt-4">
            {[
              ["Critical behaviour alerts", "Notify me immediately", true],
              ["Daily log reminder", "A nudge at 3:30 PM on school days", true],
              ["Guardian replies", "Email me when a parent responds", false],
            ].map(([title, desc, on]) => (
              <li key={title as string}>
                <label className="flex items-center justify-between gap-4">
                  <span>
                    <span className="block text-sm font-semibold text-ink">
                      {title}
                    </span>
                    <span className="block text-xs text-muted">{desc}</span>
                  </span>
                  <input
                    type="checkbox"
                    defaultChecked={on as boolean}
                    className="size-5 shrink-0 accent-brand"
                  />
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-line bg-white p-6">
          <h2 className="text-sm font-bold text-ink">Account</h2>
          <p className="pt-2 text-xs leading-5 text-muted">
            Switch accounts to sign in as another approved user, or log out and return to the public site.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void leave("/login")}
              className="flex h-10 items-center rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-mist"
            >
              Switch account
            </button>
            <button
              type="button"
              onClick={() => void leave("/")}
              className="flex h-10 items-center rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Log out
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
