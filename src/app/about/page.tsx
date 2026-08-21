import { Layout } from "@/components/layout/layout";
import { AboutIntro } from "@/components/about/about-intro";
import { aboutContent, personalInfo } from "@/components/data/content";
import { generateSEOMetadata, getCanonicalUrl } from "@/lib/seo/metadata";
import { BreadcrumbWithSchema } from "@/components/ui/breadcrumb";
import { generateBreadcrumbs } from "@/lib/seo/breadcrumbs";

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const metadata = generateSEOMetadata({
  title: 'About',
  description: `${aboutContent.intro} ${aboutContent.story.substring(0, 100)}...`,
  canonicalUrl: getCanonicalUrl('/about'),
});

const About = () => {
  const breadcrumbs = generateBreadcrumbs('/about');

  return (
    <Layout>
      <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Graphic anchor in place of a photo — echoes the header logo and
              the desktop-mode About panel's monogram device. */}
          <div className="flex h-20 w-20 items-center justify-center bg-primary font-display text-3xl font-bold text-primary-foreground mb-10">
            {initials(personalInfo.name)}
          </div>

          <BreadcrumbWithSchema items={breadcrumbs} className="mb-8" />

          <AboutIntro text={aboutContent.intro} />

          <div className="max-w-[65ch] space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>{aboutContent.story}</p>
          </div>

          <div className="max-w-[65ch] mt-12 space-y-10">
            {aboutContent.approachSections.map((section) => (
              <div key={section.label}>
                <p className="mono-label mb-3 pb-2 border-b border-border">{section.label}</p>
                <p className="text-lg text-muted-foreground leading-relaxed">{section.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
