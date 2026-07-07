'use client';

const SHORTCUTS: { keys: string; desc: string }[] = [
  { keys: 'Ctrl / ⌘ + K', desc: 'Open the app launcher' },
  { keys: 'Esc', desc: 'Close launcher, panel, or the focused window' },
  { keys: 'Shift + ← / →', desc: 'Snap the focused window to half the screen' },
  { keys: 'Shift + ↑', desc: 'Maximize the focused window' },
  { keys: 'Shift + ↓', desc: 'Restore the focused window' },
  { keys: '?', desc: 'Open this shortcuts panel' },
];

export function ShortcutsPanel() {
  return (
    <div className="h-full overflow-y-auto bg-background p-5">
      <h2 className="mb-4 text-sm font-semibold text-foreground">Keyboard shortcuts</h2>
      <div className="flex flex-col gap-1">
        {SHORTCUTS.map((s) => (
          <div
            key={s.keys}
            className="flex items-center justify-between border-b border-border/50 py-2.5"
          >
            <span className="text-sm text-foreground">{s.desc}</span>
            <span className="rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-xs text-muted-foreground">
              {s.keys}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
