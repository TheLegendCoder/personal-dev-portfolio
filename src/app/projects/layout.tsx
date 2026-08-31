import { generateSEOMetadata, getCanonicalUrl } from "@/lib/seo/metadata";
import { copy } from "@/components/data/content";

export const metadata = generateSEOMetadata({
  title: "Projects",
  description: copy.projectsMetaDescription,
  canonicalUrl: getCanonicalUrl('/projects'),
});

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
