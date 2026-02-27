import Link from 'next/link';
import { getAllProjectsAdmin } from '@/lib/projects';
import { AdminProjectRow } from '@/components/admin/project-row';
import { FolderKanban } from 'lucide-react';

export default async function AdminProjectsPage() {
  const projects = await getAllProjectsAdmin();

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
          className="inline-flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <FolderKanban className="h-4 w-4" />
          New project
        </Link>
      </div>

      {/* Table */}
      {projects.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <FolderKanban className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No projects yet. Create your first one.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left border-b border-border">
                <th className="px-4 py-3 font-medium text-muted-foreground">Title / Category</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Stack</th>
                <th className="px-4 py-3 font-medium text-muted-foreground w-24 text-center">
                  Published
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground w-24 text-center">
                  On Home
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground w-28 text-right">
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
