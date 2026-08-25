import Link from "next/link";
import { format } from "date-fns";
import { getNowContent } from "@/lib/now";
import { getAllWriting } from "@/lib/writing";
import { BreadcrumbWithSchema } from "@/components/ui/breadcrumb";
import { generateBreadcrumbs } from "@/lib/seo/breadcrumbs";
import { generateSEOMetadata, getCanonicalUrl } from "@/lib/seo/metadata";

const NOW_DESCRIPTION =
  "What I'm building, learning, exploring, and writing about right now — a current snapshot, not a résumé.";

export const metadata = generateSEOMetadata({
  title: "Now",
  description: NOW_DESCRIPTION,
  canonicalUrl: getCanonicalUrl('/now'),
});

export default async function NowPage() {
  const now = await getNowContent();
  const recent = (await getAllWriting()).slice(0, 3);
  const breadcrumbs = generateBreadcrumbs('/now');

  return (
    <div className="min-h-screen bg-background">
      <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground mb-4">
              Now
            </h1>

            <BreadcrumbWithSchema items={breadcrumbs} className="mb-4" />

            {now.updated && (
              <p className="mono-label text-muted-foreground">
                Last updated{' '}
                <time dateTime={now.updated}>
                  {format(new Date(now.updated), 'd MMMM yyyy')}
                </time>
              </p>
            )}
          </div>

          {now.body && (
            <div
              className="prose prose-invert max-w-2xl mb-16 text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: now.body }}
            />
          )}

          <div className="flex flex-col">
            {now.sections.map((section) => (
              <section
                key={section.heading}
                className="grid grid-cols-1 gap-4 border-t border-border py-8 md:grid-cols-[8rem_1fr] md:gap-10"
              >
                <h2 className="mono-label text-primary">{section.heading}</h2>
                <ul className="flex flex-col gap-3">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="border-l-2 border-border pl-4 leading-relaxed text-muted-foreground"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {recent.length > 0 && (
            <section className="mt-20 border-t border-border pt-8">
              <h2 className="mono-label mb-6 text-foreground">Recent activity</h2>
              <ul className="flex flex-col">
                {recent.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex flex-col gap-1 border-b border-border/60 py-4 transition-colors sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                    >
                      <span className="font-display text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                        {item.title}
                      </span>
                      <span className="mono-label shrink-0 text-muted-foreground">
                        {item.type === 'article' ? 'Article' : 'Tutorial'} ·{' '}
                        <time dateTime={item.date}>
                          {format(new Date(item.date), 'd MMM yyyy')}
                        </time>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
