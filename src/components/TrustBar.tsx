import trustHosted from "../assets/icons/trust-hosted.svg";
import trustApp from "../assets/icons/trust-app.svg";
import trustEncryption from "../assets/icons/trust-encryption.svg";
import trustAudit from "../assets/icons/trust-audit.svg";

/** Figma: node 264:1864 — compliance strip under the For Schools hero. */

const ITEMS = [
  { icon: trustHosted, label: "Australian-Hosted" },
  { icon: trustApp, label: "APP Compliant" },
  { icon: trustEncryption, label: "AES-256 Encryption" },
  { icon: trustAudit, label: "Full Audit Trails" },
];

export default function TrustBar() {
  return (
    <section className="bg-mist px-6 py-10 md:px-20">
      <div className="mx-auto flex max-w-shell flex-wrap items-center justify-between gap-8 px-6">
        {ITEMS.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
            <div className="size-5 overflow-clip">
              <img src={item.icon} alt="" aria-hidden className="size-full" />
            </div>
            <p className="whitespace-nowrap text-[12px] font-bold uppercase leading-4 tracking-[0.6px] text-footext">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
