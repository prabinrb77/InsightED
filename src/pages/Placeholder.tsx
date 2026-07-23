import { Link } from "react-router-dom";

/**
 * Stub page for routes whose Figma frames haven't been implemented yet.
 * The `figmaNode` prop records which frame the route maps to.
 */
export default function Placeholder({
  title,
  figmaNode,
}: {
  title: string;
  figmaNode?: string;
}) {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <span className="rounded-full border border-teal-border bg-teal-tint px-3 py-1 text-[11px] font-bold uppercase tracking-[0.55px] text-brand">
        Coming soon
      </span>
      <h1 className="text-4xl font-bold tracking-[-1px] text-ink">{title}</h1>
      <p className="max-w-md text-base leading-6 text-body">
        This page hasn't been built yet.
        {figmaNode && (
          <>
            {" "}
            It maps to Figma node{" "}
            <code className="rounded bg-line-soft px-1.5 py-0.5 text-sm text-muted">
              {figmaNode}
            </code>
            .
          </>
        )}
      </p>
      <Link
        to="/"
        className="flex h-12 items-center justify-center rounded-lg bg-brand px-6 text-base font-semibold text-white shadow-btn transition-colors hover:bg-[#255d99]"
      >
        Back to home
      </Link>
    </section>
  );
}
