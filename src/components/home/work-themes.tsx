import { workThemes } from '@/components/data/content';

/**
 * "What I work on" — a static theme strip between the hero and the project
 * cards, so the home page states what the work is about before showing it.
 * Copy lives in content.ts; this component only lays it out.
 */
export function WorkThemes() {
  if (workThemes.length === 0) return null;

  return (
    <section className="w-full pt-20 lg:pt-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="mono-label mb-8 pb-3 border-b border-border">What I work on</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {workThemes.map((theme, i) => (
            <div key={theme.label} className="flex flex-col">
              <span className="font-mono text-sm text-primary mb-3">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                {theme.label}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {theme.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
