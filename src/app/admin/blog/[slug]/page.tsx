import { getBlogPostAdmin } from '@/lib/blog';
import { PostEditor } from '@/components/admin/post-editor';
import { notFound } from 'next/navigation';

interface EditPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostAdmin(slug);

  if (!post) notFound();

  return <PostEditor post={post} />;
}
