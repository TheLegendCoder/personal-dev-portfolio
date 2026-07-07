'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MonitorX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { trackEvent } from '@/lib/posthog-events';
import { desktopApps, getApp } from './apps';
import { CASCADE_STEP_X, CASCADE_STEP_Y, TASKBAR_HEIGHT } from './constants';
import { DesktopIcon } from './desktop-icon';
import { WindowFrame, type WindowFrameHandle } from './window-frame';
import { Taskbar } from './taskbar';
import { BootScreen } from './boot-screen';
import { Launcher } from './launcher';
import { ContactPanel } from './contact-panel';

interface WindowEntry {
  appId: string;
  z: number;
  minimized: boolean;
}

export function DesktopShell() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const shellRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const windowHandles = useRef<Record<string, WindowFrameHandle | null>>({});
  const initialPositions = useRef<Record<string, { x: number; y: number }>>({});
  const zCounterRef = useRef(0);

  const [windows, setWindows] = useState<WindowEntry[]>([]);
  const [focusedAppId, setFocusedAppId] = useState<string | null>(null);
  const [booted, setBooted] = useState(false);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    trackEvent('desktop_mode_entered');
    return () => trackEvent('desktop_mode_exited');
  }, []);

  // Return focus to whichever icon opened the last window once no windows remain.
  useEffect(() => {
    if (windows.length === 0) openerRef.current?.focus();
  }, [windows.length]);

  const computeInitialPosition = useCallback((appId: string, index: number) => {
    const app = getApp(appId);
    const shellRect = shellRef.current?.getBoundingClientRect();
    const shellW = shellRect?.width ?? 1280;
    const shellH = (shellRect?.height ?? 800) - TASKBAR_HEIGHT;
    const w = app?.defaultSize.w ?? 800;
    const h = app?.defaultSize.h ?? 540;
    const x = Math.max(20, Math.min(120 + index * CASCADE_STEP_X, shellW - w - 40));
    const y = Math.max(12, Math.min(70 + index * CASCADE_STEP_Y, shellH - h - 20));
    return { x, y };
  }, []);

  const openApp = useCallback(
    (id: string, opener?: HTMLElement) => {
      if (opener) openerRef.current = opener;
      const existing = windows.find((w) => w.appId === id);
      const z = ++zCounterRef.current;
      if (existing) {
        setWindows((prev) => prev.map((w) => (w.appId === id ? { ...w, z, minimized: false } : w)));
      } else {
        initialPositions.current[id] = computeInitialPosition(id, windows.length);
        trackEvent('desktop_app_opened', { app: id });
        setWindows((prev) => [...prev, { appId: id, z, minimized: false }]);
      }
      setFocusedAppId(id);
      setLauncherOpen(false);
    },
    [windows, computeInitialPosition]
  );

  const closeApp = useCallback(
    (id: string) => {
      trackEvent('desktop_app_closed', { app: id });
      delete windowHandles.current[id];
      delete initialPositions.current[id];
      setWindows((prev) => prev.filter((w) => w.appId !== id));
      if (focusedAppId === id) {
        const candidates = windows.filter((w) => w.appId !== id && !w.minimized);
        const top = [...candidates].sort((a, b) => b.z - a.z)[0];
        setFocusedAppId(top?.appId ?? null);
      }
    },
    [windows, focusedAppId]
  );

  const focusApp = useCallback((id: string) => {
    const z = ++zCounterRef.current;
    setWindows((prev) => prev.map((w) => (w.appId === id ? { ...w, z, minimized: false } : w)));
    setFocusedAppId(id);
  }, []);

  const minimizeApp = useCallback(
    (id: string) => {
      setWindows((prev) => prev.map((w) => (w.appId === id ? { ...w, minimized: true } : w)));
      if (focusedAppId === id) {
        const candidates = windows.filter((w) => w.appId !== id && !w.minimized);
        const top = [...candidates].sort((a, b) => b.z - a.z)[0];
        setFocusedAppId(top?.appId ?? null);
      }
    },
    [windows, focusedAppId]
  );

  const handleTaskbarClick = useCallback(
    (id: string) => {
      const entry = windows.find((w) => w.appId === id);
      if (!entry) return;
      if (entry.minimized) {
        focusApp(id);
        return;
      }
      if (focusedAppId === id) {
        minimizeApp(id);
        return;
      }
      focusApp(id);
    },
    [windows, focusedAppId, focusApp, minimizeApp]
  );

  const exitDesktop = useCallback(() => {
    router.push('/');
  }, [router]);

  const toggleLauncher = useCallback(() => {
    setLauncherOpen((prev) => !prev);
    setContactOpen(false);
  }, []);

  const toggleContact = useCallback(() => {
    setContactOpen((prev) => !prev);
    setLauncherOpen(false);
  }, []);

  // Escape priority: launcher, then contact panel, then the focused window.
  // Cmd/Ctrl+K toggles the launcher; "?" opens Shortcuts; Shift+Arrow
  // snaps/maximizes/restores the focused window.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        toggleLauncher();
        return;
      }
      if (event.key === 'Escape') {
        if (launcherOpen) {
          setLauncherOpen(false);
          return;
        }
        if (contactOpen) {
          setContactOpen(false);
          return;
        }
        if (focusedAppId) closeApp(focusedAppId);
        return;
      }
      if (event.key === '?') {
        openApp('shortcuts');
        return;
      }
      if (event.shiftKey && focusedAppId) {
        const handle = windowHandles.current[focusedAppId];
        if (!handle) return;
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          handle.snap('left');
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          handle.snap('right');
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          handle.snap('maximize');
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          handle.snap('restore');
        }
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [focusedAppId, closeApp, launcherOpen, contactOpen, toggleLauncher, openApp]);

  if (isMobile) {
    return (
      <div className="desktop-wallpaper fixed inset-0 z-40 flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center shadow-card">
          <MonitorX className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-display font-semibold text-foreground">
            Desktop mode needs a bigger screen
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Visit on a larger display for the full experience, or browse the
            regular pages instead.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {desktopApps
              .filter((app) => !app.hidden)
              .map((app) => (
                <Link
                  key={app.id}
                  href={app.pageHref}
                  className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                >
                  {app.title}
                </Link>
              ))}
          </div>
          <Button className="mt-6 w-full rounded-full" onClick={exitDesktop}>
            Exit desktop mode
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={shellRef} className="desktop-wallpaper fixed inset-0 z-40 overflow-hidden">
      <div className="absolute left-4 top-4 flex flex-col gap-2">
        {desktopApps
          .filter((app) => !app.hidden)
          .map((app) => (
            <DesktopIcon
              key={app.id}
              app={app}
              isOpen={windows.some((w) => w.appId === app.id)}
              onOpen={openApp}
            />
          ))}
      </div>

      {windows.map((entry) => {
        const app = getApp(entry.appId);
        if (!app) return null;
        return (
          <WindowFrame
            key={entry.appId}
            ref={(handle) => {
              windowHandles.current[entry.appId] = handle;
            }}
            app={app}
            z={entry.z}
            minimized={entry.minimized}
            focused={focusedAppId === entry.appId}
            boundsRef={shellRef}
            initialPosition={initialPositions.current[entry.appId] ?? { x: 80, y: 60 }}
            onClose={() => closeApp(entry.appId)}
            onMinimize={() => minimizeApp(entry.appId)}
            onFocus={() => focusApp(entry.appId)}
          />
        );
      })}

      <Launcher open={launcherOpen} onOpenApp={openApp} onExit={exitDesktop} />
      <ContactPanel open={contactOpen} onClose={() => setContactOpen(false)} />

      <Taskbar
        windows={windows}
        focusedAppId={focusedAppId}
        onAppClick={handleTaskbarClick}
        onExit={exitDesktop}
        launcherOpen={launcherOpen}
        onToggleLauncher={toggleLauncher}
        onToggleContact={toggleContact}
      />

      {!booted && <BootScreen onDone={() => setBooted(true)} />}
    </div>
  );
}
