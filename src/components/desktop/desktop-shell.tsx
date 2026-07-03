'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MonitorX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { trackEvent } from '@/lib/posthog-events';
import { desktopApps } from './apps';
import { DesktopIcon } from './desktop-icon';
import { WindowFrame } from './window-frame';
import { Taskbar } from './taskbar';

export function DesktopShell() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const shellRef = useRef<HTMLDivElement>(null);
  // Icon that opened the current window, so focus can return to it on close
  const openerRef = useRef<HTMLElement | null>(null);
  const [openAppId, setOpenAppId] = useState<string | null>(null);
  const [minimized, setMinimized] = useState(false);

  const openApp = openAppId
    ? desktopApps.find((app) => app.id === openAppId) ?? null
    : null;

  useEffect(() => {
    trackEvent('desktop_mode_entered');
    return () => trackEvent('desktop_mode_exited');
  }, []);

  const handleOpen = useCallback(
    (id: string, opener?: HTMLElement) => {
      if (opener) openerRef.current = opener;
      if (openAppId === id) {
        setMinimized(false);
        return;
      }
      // One window at a time — opening another app replaces the current one
      if (openAppId) trackEvent('desktop_app_closed', { app: openAppId });
      trackEvent('desktop_app_opened', { app: id });
      setOpenAppId(id);
      setMinimized(false);
    },
    [openAppId]
  );

  const closeApp = useCallback(() => {
    if (!openAppId) return;
    trackEvent('desktop_app_closed', { app: openAppId });
    setOpenAppId(null);
    setMinimized(false);
    openerRef.current?.focus();
  }, [openAppId]);

  const toggleMinimize = useCallback(() => {
    setMinimized((prev) => !prev);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeApp();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeApp]);

  const exitDesktop = useCallback(() => {
    router.push('/');
  }, [router]);

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
              .filter((app) => app.href)
              .map((app) => (
                <Link
                  key={app.id}
                  href={app.href!}
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
    <div
      ref={shellRef}
      className="desktop-wallpaper fixed inset-0 z-40 overflow-hidden"
    >
      <div className="absolute left-4 top-4 flex flex-col gap-2">
        {desktopApps.map((app) => (
          <DesktopIcon
            key={app.id}
            app={app}
            isOpen={app.id === openAppId}
            onOpen={handleOpen}
          />
        ))}
      </div>

      {openApp && (
        <WindowFrame
          key={openApp.id}
          app={openApp}
          minimized={minimized}
          boundsRef={shellRef}
          onClose={closeApp}
          onMinimize={() => setMinimized(true)}
        />
      )}

      <Taskbar
        openApp={openApp}
        minimized={minimized}
        onAppClick={toggleMinimize}
        onExit={exitDesktop}
      />
    </div>
  );
}
