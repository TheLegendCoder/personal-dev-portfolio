import type { Metadata } from 'next';
import { DesktopShell } from '@/components/desktop/desktop-shell';

export const metadata: Metadata = {
  title: 'Desktop',
  // Window content duplicates the regular routes — keep this out of search
  robots: { index: false },
};

export default function DesktopPage() {
  return <DesktopShell />;
}
