import Link from 'next/link';
import { getAllBlogPostsAdmin } from '@/lib/blog';
import { AdminPostRow } from '@/components/admin/post-row';
import { PenLine } from 'lucide-react';

export default async function AdminBlogPage() {
  const posts = await getAllBlogPostsAdmin();

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
          className="inline-flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <PenLine className="h-4 w-4" />
          New post
        </Link>
      </div>

      {/* Table */}
      {posts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <PenLine className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No posts yet. Create your first one.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left border-b border-border">
                <th className="px-4 py-3 font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-3 font-medium text-muted-foreground w-28">Date</th>
                <th className="px-4 py-3 font-medium text-muted-foreground w-24 text-center">
                  Published
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground w-24 text-center">
                  Featured
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground w-28 text-right">
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
