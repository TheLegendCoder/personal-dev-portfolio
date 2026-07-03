import type { LucideIcon } from 'lucide-react';
import {
  Home,
  User,
  FolderKanban,
  PenSquare,
  GraduationCap,
  Settings,
} from 'lucide-react';

export interface DesktopApp {
  id: string;
  title: string;
  icon: LucideIcon;
  href?: string;          // iframe src for content apps
  component?: 'settings'; // built-in apps rendered as React, not iframe
}

export const desktopApps: DesktopApp[] = [
  { id: 'home',      title: 'Home',      icon: Home,          href: '/' },
  { id: 'about',     title: 'About',     icon: User,          href: '/about' },
  { id: 'projects',  title: 'Projects',  icon: FolderKanban,  href: '/projects' },
  { id: 'blog',      title: 'Blog',      icon: PenSquare,     href: '/blog' },
  { id: 'tutorials', title: 'Tutorials', icon: GraduationCap, href: '/tutorials' },
  { id: 'settings',  title: 'Settings',  icon: Settings,      component: 'settings' },
];
