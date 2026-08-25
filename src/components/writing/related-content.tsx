import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { RelatedContent, RelatedLink } from "@/lib/related-content";

const GROUPS: { key: keyof RelatedContent; heading: string }[] = [
  { key: 'projects', heading: 'Related project' },
  { key: 'articles', heading: 'Related reading' },
  { key: 'tutorials', heading: 'Related tutorial' },
];

function RelatedRow({ link }: { link: RelatedLink }) {
  return (
    <li>
      <Link
        href={link.href}
        className="group flex flex-col gap-2 border-b border-border/60 py-5 last:border-b-0"
      >
        <span className="flex items-center gap-2 font-display text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
          {link.title}
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
          />
        </span>
        <span className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {link.description}
        </span>
      </Link>
    </li>
  );
}

/**
 * The project ↔ article ↔ tutorial ecosystem block, rendered at the foot of
 * every detail page. Renders nothing at all when a piece has no relations —
 * an empty "Related" heading is worse than no heading.
 */
export function RelatedContentSection({ related }: { related: RelatedContent }) {
  const groups = GROUPS.filter(({ key }) => related[key].length > 0);
  if (groups.length === 0) return null;

  return (
    <section className="mt-20 border-t border-border pt-10">
      <h2 className="mono-label mb-8 text-foreground">Keep going</h2>
      <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {groups.map(({ key, heading }) => (
          <div key={key}>
            <h3 className="mono-label mb-4 border-b border-border pb-2 text-primary">
              {heading}
            </h3>
            <ul className="flex flex-col">
              {related[key].map((link) => (
                <RelatedRow key={link.href} link={link} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
