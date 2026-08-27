import { Layout } from "@/components/layout/layout";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Building Interactive Blog Posts with MDX",
  description: "Learn how to create engaging, interactive blog content using MDX with React components in Next.js.",
};

export default function MDXBlogPost() {
  const formattedDate = new Date("2026-02-05").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Layout>
      <article className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          {/* Back Button */}
          <Link
            href="/writing?type=articles"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Writing
          </Link>

          {/* Header */}
          <header className="mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
              Building Interactive Blog Posts with MDX
            </h1>

            <p className="text-lg text-muted-foreground mb-6">
              Learn how to create engaging, interactive blog content using MDX with React components in Next.js.
            </p>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-t border-border pt-6">
              <div>
                <span className="font-semibold text-foreground">Tsholofelo Ndawonde</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <time dateTime="2026-02-05">{formattedDate}</time>
              <span className="hidden sm:inline">•</span>
              <span>6 min read</span>
            </div>
          </header>

          {/* Content with MDX Components */}
          <div className="space-y-6">
            <p className="text-foreground/90 leading-relaxed">
              MDX is a powerful format that combines <strong>Markdown</strong> with <strong>JSX</strong>, allowing you to use React components directly in your content. This creates endless possibilities for interactive, engaging blog posts.
            </p>

            <h2 className="text-3xl font-display font-bold text-foreground mt-10 mb-4">
              What Makes MDX Special?
            </h2>

            <p className="text-foreground/90 leading-relaxed">
              Regular Markdown is great for static content, but MDX takes it to the next level by letting you:
            </p>

            <ul className="list-disc list-inside space-y-2 ml-4 text-foreground/90">
              <li>Embed interactive React components</li>
              <li>Create custom styled elements</li>
              <li>Build engaging user experiences</li>
              <li>Maintain the simplicity of Markdown syntax</li>
            </ul>

            <Alert className="my-6">
              <AlertTitle>💡 Pro Tip</AlertTitle>
              <AlertDescription>
                MDX files are processed at build time, so all your interactive components are fully optimized and performant.
              </AlertDescription>
            </Alert>

            <h2 className="text-3xl font-display font-bold text-foreground mt-10 mb-4">
              Interactive Component Examples
            </h2>

            <h3 className="text-2xl font-display font-bold text-foreground mt-8 mb-3">
              Buttons and Badges
            </h3>

            <p className="text-foreground/90 leading-relaxed mb-4">
              You can embed UI components directly in your content. Here are some interactive elements:
            </p>

            <div className="flex flex-wrap gap-4 my-6">
              <Button variant="default" size="lg">
                Click Me!
              </Button>
              <Button variant="outline" size="lg">
                Outline Style
              </Button>
              <Button variant="ghost" size="lg">
                Ghost Button
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 my-6">
              <Badge variant="default">React</Badge>
              <Badge variant="secondary">Next.js</Badge>
              <Badge variant="outline">TypeScript</Badge>
              <Badge variant="default">Tailwind CSS</Badge>
            </div>

            <h3 className="text-2xl font-display font-bold text-foreground mt-8 mb-3">
              Feature Cards
            </h3>

            <p className="text-foreground/90 leading-relaxed mb-4">
              Create beautiful, structured content with Card components:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
              <Card>
                <CardHeader>
                  <CardTitle>🚀 Performance</CardTitle>
                  <CardDescription>Built for speed</CardDescription>
                </CardHeader>
                <CardContent>
                  MDX content is compiled at build time, ensuring optimal performance and fast page loads.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🎨 Customizable</CardTitle>
                  <CardDescription>Style it your way</CardDescription>
                </CardHeader>
                <CardContent>
                  Use Tailwind CSS classes and custom components to create unique designs that match your brand.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📝 Markdown Syntax</CardTitle>
                  <CardDescription>Simple and familiar</CardDescription>
                </CardHeader>
                <CardContent>
                  Write content using the Markdown syntax you already know and love, enhanced with React components.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>⚡ Type-Safe</CardTitle>
                  <CardDescription>TypeScript support</CardDescription>
                </CardHeader>
                <CardContent>
                  Full TypeScript support ensures your components are properly typed and error-free.
                </CardContent>
              </Card>
            </div>

            <h2 className="text-3xl font-display font-bold text-foreground mt-10 mb-4">
              Getting Started with MDX
            </h2>

            <p className="text-foreground/90 leading-relaxed">
              To start using MDX in your Next.js project:
            </p>

            <ol className="list-decimal list-inside space-y-2 ml-4 text-foreground/90 my-4">
              <li><strong>Install dependencies</strong>: <code className="bg-muted px-1.5 py-0.5 rounded">@next/mdx</code> and <code className="bg-muted px-1.5 py-0.5 rounded">@mdx-js/loader</code></li>
              <li><strong>Configure Next.js</strong>: Update your <code className="bg-muted px-1.5 py-0.5 rounded">next.config.ts</code> to process MDX files</li>
              <li><strong>Create MDX pages</strong>: Add <code className="bg-muted px-1.5 py-0.5 rounded">.mdx</code> files in your app directory</li>
              <li><strong>Import components</strong>: Use any React component directly in your MDX content</li>
            </ol>

            <Separator className="my-8" />

            <h2 className="text-3xl font-display font-bold text-foreground mt-10 mb-4">
              Best Practices
            </h2>

            <p className="text-foreground/90 leading-relaxed">
              When working with MDX, keep these tips in mind:
            </p>

            <ul className="list-disc list-inside space-y-2 ml-4 text-foreground/90 my-4">
              <li><strong>Keep it simple</strong>: Don't overuse components. Maintain readability</li>
              <li><strong>Performance matters</strong>: Components are rendered at build time</li>
              <li><strong>Accessibility first</strong>: Ensure all interactive elements are keyboard accessible</li>
              <li><strong>Type safety</strong>: Use TypeScript for component props to catch errors early</li>
            </ul>

            <Alert className="my-6">
              <AlertTitle>🎯 Key Takeaway</AlertTitle>
              <AlertDescription>
                MDX bridges the gap between simple content authoring and powerful interactive experiences. It's the perfect choice for modern blog platforms.
              </AlertDescription>
            </Alert>

            <h2 className="text-3xl font-display font-bold text-foreground mt-10 mb-4">
              Conclusion
            </h2>

            <p className="text-foreground/90 leading-relaxed">
              MDX empowers content creators to build rich, interactive experiences without sacrificing the simplicity of Markdown. Whether you're building documentation, blog posts, or landing pages, MDX provides the perfect balance of power and simplicity.
            </p>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Ready to Try MDX?</CardTitle>
                <CardDescription>Start creating interactive content today</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-foreground/90">
                  This entire blog post demonstrates how seamlessly React components integrate with content in Next.js.
                </p>
                <Button variant="default" size="lg">
                  Explore More Examples
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Tags */}
          <footer className="mt-12 sm:mt-16 pt-8 border-t border-border">
            <div className="flex flex-wrap gap-2">
              <span className="inline-block px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full">
                #MDX
              </span>
              <span className="inline-block px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full">
                #React
              </span>
              <span className="inline-block px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full">
                #Next.js
              </span>
              <span className="inline-block px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full">
                #Interactive
              </span>
            </div>
          </footer>
        </div>
      </article>
    </Layout>
  );
}
