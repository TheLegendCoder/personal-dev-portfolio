import { ImageResponse } from 'next/og';
import { personalInfo } from '@/components/data/content';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      // Literal hex is required here — next/og's Satori renderer can't resolve
      // CSS custom properties. Values are the computed sRGB equivalents of this
      // project's dark-mode tokens (globals.css .dark): --background, --primary,
      // --foreground, --muted-foreground — kept in lockstep with the real palette.
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#05080f',
          color: '#f3f5f7',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 88,
            height: 88,
            background: '#4b8df6',
            color: '#ffffff',
            fontSize: 36,
            fontWeight: 700,
            marginBottom: 48,
          }}
        >
          {personalInfo.name
            .split(' ')
            .map((p) => p[0])
            .slice(0, 2)
            .join('')}
        </div>
        <div style={{ display: 'flex', fontSize: 64, fontWeight: 700, letterSpacing: '-0.02em' }}>
          {personalInfo.name}
        </div>
        <div style={{ display: 'flex', fontSize: 32, color: '#949ba8', marginTop: 16 }}>
          {personalInfo.title}. {personalInfo.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
