import { notFound } from 'next/navigation';
import { getProjectByIdAdmin } from '@/lib/projects';
import { ProjectEditor } from '@/components/admin/project-editor';

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const project = await getProjectByIdAdmin(id);

  if (!project) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <ProjectEditor project={project} />
    </div>
  );
}
