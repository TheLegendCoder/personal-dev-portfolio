---
name: Telemetry Noir
colors:
  surface: '#121416'
  surface-dim: '#121416'
  surface-bright: '#38393c'
  surface-container-lowest: '#0c0e10'
  surface-container-low: '#1a1c1e'
  surface-container: '#1e2022'
  surface-container-high: '#282a2c'
  surface-container-highest: '#333537'
  on-surface: '#e2e2e5'
  on-surface-variant: '#e9bcb5'
  inverse-surface: '#e2e2e5'
  inverse-on-surface: '#2f3033'
  outline: '#af8781'
  outline-variant: '#5e3f3a'
  surface-tint: '#ffb4a8'
  primary: '#ffb4a8'
  on-primary: '#680200'
  primary-container: '#e10600'
  on-primary-container: '#fff2f0'
  inverse-primary: '#c00500'
  secondary: '#c4c7c8'
  on-secondary: '#2d3132'
  secondary-container: '#464a4b'
  on-secondary-container: '#b6b9ba'
  tertiary: '#b4c5ff'
  on-tertiary: '#002a77'
  tertiary-container: '#0163ff'
  on-tertiary-container: '#f4f4ff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a8'
  on-primary-fixed: '#410100'
  on-primary-fixed-variant: '#930300'
  secondary-fixed: '#e0e3e4'
  secondary-fixed-dim: '#c4c7c8'
  on-secondary-fixed: '#181c1d'
  on-secondary-fixed-variant: '#444748'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174a'
  on-tertiary-fixed-variant: '#003ea7'
  background: '#121416'
  on-background: '#e2e2e5'
  surface-variant: '#333537'
  surface-tier: '#12161A'
  border-muted: '#293038'
  on-surface-bright: '#f2f4f5'
  status-active: '#e10600'
  telemetry-grid: rgba(41, 48, 56, 0.15)
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 72px
    fontWeight: '800'
    lineHeight: 72px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 36px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  mono-label:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  container-max: 1440px
---

## Brand & Style

**Telemetry Noir** is a high-precision, technical design system inspired by motorsport engineering and terminal-based data analysis. The aesthetic sits at the intersection of **Neo-Brutalism** and **Sci-Fi Futurism**, designed for specialists who value density, performance, and analytical clarity.

The brand personality is authoritative, "engineered," and uncompromisingly technical. It avoids soft gradients and organic shapes in favor of sharp lines, high-contrast states, and functional "telemetry" overlays (grids, scanlines, and status indicators). The emotional response should be one of being "at the controls" of a sophisticated, high-performance machine.

## Colors

The palette is anchored in a "Deep Space" neutral base (`#0b0d0f`) to maximize contrast for technical data. 

- **Primary (Racing Red):** Used exclusively for high-priority status indicators, primary actions, and "live" telemetry signals.
- **Secondary (Engineered Grey):** Provides high legibility for secondary data points and body text, maintaining a neutral, low-strain reading environment.
- **Surface Tiers:** Depth is managed through subtle shifts in dark desaturated blues/greys rather than elevation shadows.
- **Functional Accents:** Tertiary blue is reserved for links or specific system metadata classifications to differentiate from action-oriented red.

## Typography

The typographic system utilizes a three-tier font strategy:
1. **Hanken Grotesk:** The "Impact" tier. Used for major headers and section titles. It should always be high-weight and often uppercase to simulate industrial signage.
2. **Inter:** The "Utility" tier. Used for long-form reading and descriptive text where legibility is paramount.
3. **JetBrains Mono:** The "Technical" tier. Used for all metadata, status codes, labels, and data visualizations. This reinforces the "system output" aesthetic.

**Note:** Tighten letter-spacing on large headlines to maintain the "dense" engineered look.

## Layout & Spacing

The system follows a **12-column fixed grid** for desktop, constrained to a 1440px container. On mobile, it collapses to a single-column fluid flow with 16px safe-area margins.

Spacing is strictly mathematical, built on a **4px base unit**. All gaps between elements should be multiples of 4 (e.g., 24px gutters, 32px section gaps, 64px hero margins). 

**Key Layout Features:**
- **Asymmetric Balance:** Use 8-column/4-column splits for metadata panels.
- **Section Dividers:** Sections are separated by explicit 1px borders rather than just whitespace to emphasize structural "assembly."

## Elevation & Depth

Telemetry Noir avoids traditional shadows. Depth is achieved through **Tonal Layering** and **Technical Outlines**:
- **Level 0 (Background):** Pure `#0b0d0f` with a subtle 32px grid pattern.
- **Level 1 (Containers):** `#12161a` with 1px `#293038` borders.
- **State Changes:** Hover states use "inner glow" simulations via 1px primary-colored borders or scale transforms (1.02x) rather than elevation shadows.
- **Overlays:** Transparent scanlines and "telemetry lines" (animated gradients) provide a sense of active data processing above the surface.

## Shapes

The default shape language is **Sharp (0px)**. 

To introduce technical variety without losing the industrial edge, use **Corner Clipping**. Any container with `clip-corner` should have a 16px diagonal cut on the bottom-right corner. Small UI indicators (status dots, progress bar caps) may use `full` rounding to provide a visual "pulse" against the rigid grid.

## Components

### Buttons
- **Primary:** Solid `#e10600` background, `#f2f4f5` mono text. No rounding. Hover effect: 4px vertical lift and glow shadow `0 4px 20px rgba(225, 6, 0, 0.2)`.
- **Outline:** 1px border `#293038`, mono text. Hover: border shifts to Primary Red.

### Technical Cards
- Background `#12161a`.
- 1px border `#293038`.
- Use a "Metadata Header": a top-aligned label in `mono-label` with a bottom border to separate system IDs from content.

### Progress & Telemetry
- **Progress Bars:** 6px height, `#293038` track. Fill uses Primary Red with a "glow" shadow on the leading edge.
- **Status Dots:** 8px circles with a 2-second pulse animation (`opacity: 1` to `0.5`).

### Inputs
- Dark-themed fields with 1px borders. Focus state should use the Primary Red border and a `>` character prefix to simulate a terminal prompt.