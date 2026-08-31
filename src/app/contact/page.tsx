import { personalInfo } from "@/components/data/content";
import { ContactChannels } from "@/components/contact/contact-channels";
import { BreadcrumbWithSchema } from "@/components/ui/breadcrumb";
import { generateBreadcrumbs } from "@/lib/seo/breadcrumbs";
import { generateSEOMetadata, getCanonicalUrl } from "@/lib/seo/metadata";

const CONTACT_DESCRIPTION =
  "How to reach Tsholofelo Ndawonde — email, LinkedIn, and GitHub — plus what I'm currently open to.";

export const metadata = generateSEOMetadata({
  title: "Contact",
  description: CONTACT_DESCRIPTION,
  canonicalUrl: getCanonicalUrl('/contact'),
});

const OPEN_TO = [
  'Software engineering roles, particularly backend and distributed systems work.',
  'Consulting on architecture, .NET services, and cloud infrastructure.',
  'Questions about anything I have written here — those are always welcome.',
  'Collaboration on open-source projects worth the time.',
];

export default function ContactPage() {
  const breadcrumbs = generateBreadcrumbs('/contact');

  return (
    <div className="min-h-screen bg-background">
      <section className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground mb-4">
              Contact
            </h1>

            <BreadcrumbWithSchema items={breadcrumbs} className="mb-4" />

            <p className="text-lg text-muted-foreground">
              The quickest ways to reach me. I read everything and reply to most
              things within a few days.
            </p>
          </div>

          <div className="mb-6 flex items-center gap-3 border border-border px-4 py-3">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
            </span>
            <span className="mono-label text-foreground">
              {personalInfo.availability}
            </span>
            <span className="mono-label ml-auto text-muted-foreground">
              {personalInfo.location}
            </span>
          </div>

          <ContactChannels />

          <section className="mt-16">
            <h2 className="mono-label mb-6 border-b border-border pb-3 text-foreground">
              What I'm open to
            </h2>
            <ul className="flex flex-col gap-3">
              {OPEN_TO.map((item) => (
                <li
                  key={item}
                  className="border-l-2 border-border pl-4 leading-relaxed text-muted-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </div>
  );
}
