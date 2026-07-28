import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import iconCap from "../assets/icons/auth-graduation-cap.svg";
import iconTeacher from "../assets/icons/auth-role-teacher.svg";
import iconParent from "../assets/icons/auth-role-parent.svg";
import iconSpecialist from "../assets/icons/auth-role-specialist.png";
import arrowRight from "../assets/icons/auth-arrow-right.svg";
import arrowSales from "../assets/icons/auth-arrow-sales.svg";

/** Figma: node 186:1103 "P-018 Sign Up — Choose Path" */

const PATHS = [
  {
    icon: iconTeacher,
    role: "Teacher",
    body: "Sign up to join your school's MiZanova account. You'll need your school's invite code or to select your school from a list.",
    to: "/signup/teacher",
  },
  {
    icon: iconParent,
    role: "Parent",
    body: "Sign up to support your child. You can join your child's school if they're already on MiZanova, or start independently.",
    to: "/signup/parent",
  },
  {
    icon: iconSpecialist,
    role: "Specialist",
    body: "Sign up to support your students and families. You can join an existing school on MiZanova, or manage your specialist practice independently.",
    to: "/signup/specialist",
  },
];

export default function SignupPage() {
  return (
    <AuthLayout variant="portal">
      <div className="w-full max-w-[1002px] rounded-xl border border-authline bg-white px-6 py-12 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-brand">
            <span className="h-6 w-[30px] overflow-clip">
              <img src={iconCap} alt="" aria-hidden className="size-full" />
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-2 pt-6 text-center">
          <h1 className="text-2xl font-bold leading-8 tracking-[-0.07px] text-[#0F172A]">
            Welcome to MiZanova
          </h1>
          <p className="text-sm leading-5 text-authslate">
            Tell us how you'll be using MiZanova
          </p>
        </div>

        <div className="grid gap-3 pt-6 md:grid-cols-3">
          {PATHS.map((p) => (
            <article
              key={p.role}
              className="flex flex-col items-center rounded-xl border border-authline bg-white p-6 transition-colors hover:border-brand"
            >
              <span className="flex size-16 items-center justify-center rounded-full bg-authchip">
                <span className="h-6 w-[30px] overflow-clip">
                  <img src={p.icon} alt="" aria-hidden className="size-full object-contain" />
                </span>
              </span>

              <h2 className="pt-4 text-lg font-semibold leading-7 text-[#0F172A]">
                {p.role}
              </h2>

              <p className="flex-1 pt-2 text-center text-xs leading-[19.5px] text-authslate">
                {p.body}
              </p>

              <Link
                to={p.to}
                className="flex items-center gap-1 pt-4 text-sm font-semibold leading-5 text-brand hover:underline"
              >
                Continue
                <span className="h-3.5 w-[12.25px] overflow-clip">
                  <img
                    src={arrowRight}
                    alt=""
                    aria-hidden
                    className="size-full"
                  />
                </span>
              </Link>
            </article>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2 pt-6">
          <p className="flex flex-wrap items-center justify-center gap-1.5 text-center text-sm leading-5 text-[#334155]">
            Are you a school admin setting up a new institution?
            <a
              href="#sales"
              className="flex items-center gap-1 font-semibold text-brand hover:underline"
            >
              Talk to sales
              <span className="h-3 w-[10.5px] overflow-clip">
                <img
                  src={arrowSales}
                  alt=""
                  aria-hidden
                  className="size-full"
                />
              </span>
            </a>
          </p>

          <p className="flex gap-1 text-sm leading-5 text-authslate">
            Already have an account?
            <Link to="/login" className="font-semibold text-brand hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
