import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'CMS Admin',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link
              href="/admin/blog"
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              CMS
            </Link>
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/admin/blog" className="hover:text-foreground transition-colors">
                Posts
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to site
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

// Server component sign-out form
async function SignOutButton() {
  return (
    <form action="/api/admin/signout" method="POST">
      <button
        type="submit"
        className="text-muted-foreground hover:text-destructive transition-colors"
      >
        Sign out
      </button>
    </form>
  );
}
