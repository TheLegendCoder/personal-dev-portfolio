'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PenLine, FolderKanban, ArrowLeft, LogOut, Zap } from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const isPostsActive = pathname.startsWith('/admin/blog');
  const isProjectsActive = pathname.startsWith('/admin/projects');
  const isTutorialsActive = pathname.startsWith('/admin/tutorials');

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-56 min-h-screen bg-card border-r border-border flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
        <SidebarContents isPostsActive={isPostsActive} isProjectsActive={isProjectsActive} isTutorialsActive={isTutorialsActive} />
      </aside>

      {/* ── Mobile top bar ───────────────────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Brand mark */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm text-foreground">TN Studio</span>
          </div>
          {/* Nav links */}
          <nav className="flex items-center gap-1">
            <Link
              href="/admin/blog"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                isPostsActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <PenLine className="h-3.5 w-3.5" />
              Posts
            </Link>
            <Link
              href="/admin/projects"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                isProjectsActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <FolderKanban className="h-3.5 w-3.5" />
              Projects
            </Link>
            <Link
              href="/admin/tutorials"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                isTutorialsActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <PenLine className="h-3.5 w-3.5" />
              Tutorials
            </Link>
          </nav>
          {/* Sign out */}
          <form action="/api/admin/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Out
            </button>
          </form>
        </div>
      </header>
    </>
  );
}

// Extracted so both desktop sidebar and (if ever needed) drawer can share markup
function SidebarContents({
  isPostsActive,
  isProjectsActive,
  isTutorialsActive,
}: {
  isPostsActive: boolean;
  isProjectsActive: boolean;
  isTutorialsActive: boolean;
}) {
  return (
    <>
      {/* Brand */}
      <div className="px-4 pt-6 pb-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
            <Zap className="h-4.5 w-4.5 text-primary-foreground" style={{ width: '1.125rem', height: '1.125rem' }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">TN Studio</p>
            <p className="text-xs text-muted-foreground mt-0.5">Content CMS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="px-2 pb-2 text-[0.625rem] font-semibold text-muted-foreground tracking-widest uppercase">
          Content
        </p>
        <Link
          href="/admin/blog"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
            isPostsActive
              ? 'bg-primary/10 text-primary font-medium shadow-[inset_2px_0_0_hsl(var(--primary))]'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <PenLine className="h-4 w-4 shrink-0" />
          Posts
        </Link>
        <Link
          href="/admin/projects"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
            isProjectsActive
              ? 'bg-primary/10 text-primary font-medium shadow-[inset_2px_0_0_hsl(var(--primary))]'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <FolderKanban className="h-4 w-4 shrink-0" />
          Projects
        </Link>
        <Link
          href="/admin/tutorials"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
            isTutorialsActive
              ? 'bg-primary/10 text-primary font-medium shadow-[inset_2px_0_0_hsl(var(--primary))]'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <PenLine className="h-4 w-4 shrink-0" />
          Tutorials
        </Link>
      </nav>

      {/* Footer actions */}
      <div className="px-3 pb-5 pt-3 border-t border-border space-y-1">
        <Link
          href="/"
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Home
        </Link>
        <form action="/api/admin/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}
