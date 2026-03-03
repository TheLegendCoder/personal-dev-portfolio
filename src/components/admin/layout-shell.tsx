'use client';

import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/sidebar';

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Login page gets no chrome — full-screen form only
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      {/* Offset main on mobile to clear the sticky top bar */}
      <main className="flex-1 min-w-0 md:p-8 p-4 pt-6 md:pt-8">{children}</main>
    </div>
  );
}
