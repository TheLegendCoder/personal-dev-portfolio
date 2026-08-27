import type { LucideIcon } from 'lucide-react';
import {
  User,
  FolderKanban,
  PenSquare,
  GraduationCap,
  Settings,
  Keyboard,
} from 'lucide-react';

export type AppTint = 'primary' | 'accent';

export type DesktopComponent =
  | 'settings'
  | 'about'
  | 'projects'
  | 'blog-reader'
  | 'tutorials-reader'
  | 'shortcuts';

export interface DesktopApp {
  id: string;
  title: string;
  icon: LucideIcon;
  href?: string; // iframe src for content apps
  component?: DesktopComponent; // native window body
  /** The real route this app represents, for the mobile fallback card and the launcher. */
  pageHref: string;
  defaultSize: { w: number; h: number };
  tint: AppTint;
  /** Hidden from the launcher/desktop icon grid but still openable (e.g. via a keyboard shortcut). */
  hidden?: boolean;
}

export const desktopApps: DesktopApp[] = [
  {
    id: 'about',
    title: 'About',
    icon: User,
    component: 'about',
    pageHref: '/about',
    defaultSize: { w: 720, h: 480 },
    tint: 'primary',
  },
  {
    id: 'projects',
    title: 'Projects',
    icon: FolderKanban,
    component: 'projects',
    pageHref: '/projects',
    defaultSize: { w: 840, h: 560 },
    tint: 'primary',
  },
  {
    id: 'blog',
    title: 'Blog',
    icon: PenSquare,
    component: 'blog-reader',
    pageHref: '/writing?type=articles',
    defaultSize: { w: 800, h: 540 },
    tint: 'primary',
  },
  {
    id: 'tutorials',
    title: 'Tutorials',
    icon: GraduationCap,
    component: 'tutorials-reader',
    pageHref: '/writing?type=tutorials',
    defaultSize: { w: 800, h: 540 },
    tint: 'accent',
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings,
    component: 'settings',
    pageHref: '/',
    defaultSize: { w: 480, h: 420 },
    tint: 'primary',
  },
  {
    id: 'shortcuts',
    title: 'Shortcuts',
    icon: Keyboard,
    component: 'shortcuts',
    pageHref: '/',
    defaultSize: { w: 460, h: 420 },
    tint: 'primary',
    hidden: true,
  },
];

export function getApp(id: string): DesktopApp | undefined {
  return desktopApps.find((app) => app.id === id);
}
