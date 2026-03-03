import Link from 'next/link';
import { getAllProjectsAdmin } from '@/lib/projects';
import { AdminProjectRow } from '@/components/admin/project-row';
import { FolderKanban, Layers, CheckCircle2, Home } from 'lucide-react';

export default async function AdminProjectsPage() {
  const projects = await getAllProjectsAdmin();
  const publishedCount = projects.filter((p) => p.published).length;
  const featuredCount = projects.filter((p) => p.featured).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {projects.length} project{projects.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow active:scale-[0.98]"
        >
          <FolderKanban className="h-4 w-4" />
          New project
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Layers className="h-4.5 w-4.5 text-primary" style={{ width: '1.125rem', height: '1.125rem' }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground leading-none">{projects.length}</p>
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
          <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
            <Home className="h-4.5 w-4.5 text-violet-500" style={{ width: '1.125rem', height: '1.125rem' }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground leading-none">{featuredCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">On home</p>
          </div>
        </div>
      </div>

      {/* Table */}
      {projects.length === 0 ? (
        <div className="rounded-xl border border-border bg-card text-center py-20 text-muted-foreground">
          <FolderKanban className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No projects yet. Create your first one.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary/5 text-left border-b border-border">
                <th className="px-4 py-3 font-semibold text-foreground/70 text-xs uppercase tracking-wide">Title / Category</th>
                <th className="px-4 py-3 font-semibold text-foreground/70 text-xs uppercase tracking-wide">Stack</th>
                <th className="px-4 py-3 font-semibold text-foreground/70 text-xs uppercase tracking-wide w-24 text-center">
                  Published
                </th>
                <th className="px-4 py-3 font-semibold text-foreground/70 text-xs uppercase tracking-wide w-24 text-center">
                  On Home
                </th>
                <th className="px-4 py-3 font-semibold text-foreground/70 text-xs uppercase tracking-wide w-28 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((project) => (
                <AdminProjectRow key={project.id} project={project} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
