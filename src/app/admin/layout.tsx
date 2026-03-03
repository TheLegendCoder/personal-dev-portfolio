import type { Metadata } from 'next';
import { AdminLayoutShell } from '@/components/admin/layout-shell';

export const metadata: Metadata = {
  title: 'CMS Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
