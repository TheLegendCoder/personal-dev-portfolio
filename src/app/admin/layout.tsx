import type { Metadata } from 'next';
import { AdminSidebar } from '@/components/admin/sidebar';

export const metadata: Metadata = {
  title: 'CMS Admin',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      {/* Offset main on mobile to clear the sticky top bar */}
      <main className="flex-1 min-w-0 md:p-8 p-4 pt-6 md:pt-8">{children}</main>
    </div>
  );
}
