export const dynamic = 'force-dynamic';

import { getNowAdmin } from '@/lib/now';
import { NowEditor } from '@/components/admin/now-editor';

export default async function AdminNowPage() {
  const now = await getNowAdmin();
  return <NowEditor now={now} />;
}
