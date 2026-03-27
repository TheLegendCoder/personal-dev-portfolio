import { getTutorialAdmin } from '@/lib/tutorial';
import { TutorialEditor } from '@/components/admin/tutorial-editor';
import { notFound } from 'next/navigation';

interface EditTutorialPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditTutorialPage({ params }: EditTutorialPageProps) {
  const { slug } = await params;
  const tutorial = await getTutorialAdmin(slug);

  if (!tutorial) notFound();

  return <TutorialEditor tutorial={tutorial} />;
}
