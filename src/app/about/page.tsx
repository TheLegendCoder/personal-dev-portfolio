import { Layout } from "@/components/layout/layout";
import { aboutContent } from "@/components/data/content";
import { generateSEOMetadata, getCanonicalUrl } from "@/lib/seo/metadata";
import { BreadcrumbWithSchema } from "@/components/ui/breadcrumb";
import { generateBreadcrumbs } from "@/lib/seo/breadcrumbs";

export const metadata = generateSEOMetadata({
  title: 'About',
  description: aboutContent.intro + ' ' + aboutContent.story.substring(0, 100) + '...',
  canonicalUrl: getCanonicalUrl('/about'),
});

const About = () => {
  const breadcrumbs = generateBreadcrumbs('/about');

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">About Me</h1>
          
          {/* Breadcrumb Navigation */}
          <BreadcrumbWithSchema items={breadcrumbs} className="mb-8" />
          
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-muted-foreground mb-8">{aboutContent.intro}</p>
            <p className="text-muted-foreground mb-6">{aboutContent.story}</p>
            <p className="text-muted-foreground mb-12">{aboutContent.approach}</p>
          </div>       
        </div>
      </section>
    </Layout>
  );
};

export default About;
