export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getAllBlogPostsAdminSummary } from '@/lib/blog';
import { AdminPostRow } from '@/components/admin/post-row';
import { PenLine, FileText, CheckCircle2, Star } from 'lucide-react';

export default async function AdminBlogPage() {
  const posts = await getAllBlogPostsAdminSummary();
  const publishedCount = posts.filter((p) => p.published).length;
  const draftCount = posts.length - publishedCount;
  const featuredCount = posts.filter((p) => p.featured).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {posts.length} post{posts.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow active:scale-[0.98]"
        >
          <PenLine className="h-4 w-4" />
          New post
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="h-4.5 w-4.5 text-primary" style={{ width: '1.125rem', height: '1.125rem' }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground leading-none">{posts.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-4.5 w-4.5 text-accent" style={{ width: '1.125rem', height: '1.125rem' }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground leading-none">{publishedCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Published</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
            <Star className="h-4.5 w-4.5 text-amber-500" style={{ width: '1.125rem', height: '1.125rem' }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground leading-none">{draftCount > 0 ? draftCount : featuredCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{draftCount > 0 ? 'Drafts' : 'Featured'}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      {posts.length === 0 ? (
        <div className="rounded-xl border border-border bg-card text-center py-20 text-muted-foreground">
          <PenLine className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No posts yet. Create your first one.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary/5 text-left border-b border-border">
                <th className="px-4 py-3 font-semibold text-foreground/70 text-xs uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 font-semibold text-foreground/70 text-xs uppercase tracking-wide w-28">Date</th>
                <th className="px-4 py-3 font-semibold text-foreground/70 text-xs uppercase tracking-wide w-24 text-center">
                  Published
                </th>
                <th className="px-4 py-3 font-semibold text-foreground/70 text-xs uppercase tracking-wide w-24 text-center">
                  Featured
                </th>
                <th className="px-4 py-3 font-semibold text-foreground/70 text-xs uppercase tracking-wide w-28 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((post) => (
                <AdminPostRow key={post.slug} post={post} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
