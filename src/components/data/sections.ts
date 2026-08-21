// Section data for the cinematic home page sections
// Separated from content.ts to keep each file manageable

// ─── Engineering Capabilities ─────────────────────────────────────────────────

export const architecturePrinciples = [
  "Idempotency",
  "Clean Architecture",
  "Observability",
  "CI/CD Pipelines",
  "Test Coverage",
  "Domain-Driven Design",
  "Event Sourcing",
  "API Contracts",
];

export const telemetryLogLines = [
  "\u25b6  build:prod        \u2014 compiling\u2026",
  "\u2713  build:prod        \u2014 14.2s",
  "\u25b6  test:unit         \u2014 running 47 tests\u2026",
  "\u2713  test:unit         \u2014 47/47 passed",
  "\u25b6  docker:build      \u2014 layering image\u2026",
  "\u2713  docker:build      \u2014 8.7s",
  "\u25b6  deploy:staging    \u2014 pushing\u2026",
  "\u2713  health check      \u2014 /api/health \u2192 200",
  "\u25b6  deploy:prod       \u2014 v2.4.1",
  "\u2713  deploy:prod       \u2014 live in 3.1s",
  "\u2713  monitoring        \u2014 all systems nominal",
];

export interface ReleaseCell {
  day: string;
  week: number;
  status: "shipped" | "planned" | "idle";
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Deterministic ship pattern (row = day, col = week index 0-3)
const SHIP_PATTERN: boolean[][] = [
  [true,  true,  false, true],
  [true,  false, true,  true],
  [true,  true,  true,  false],
  [false, true,  true,  true],
  [true,  true,  false, true],
  [false, false, false, false],
  [false, false, false, false],
];

export const releaseSchedule: ReleaseCell[] = DAYS.flatMap((day, di) =>
  [1, 2, 3, 4].map(
    (week, wi) =>
      ({
        day,
        week,
        status: wi === 3 ? "planned" : SHIP_PATTERN[di][wi] ? "shipped" : "idle",
      } as ReleaseCell)
  )
);

// ─── Protocol — How I Build ───────────────────────────────────────────────────

export const protocolSteps = [
  {
    number: "01",
    title: "Design the System",
    summary: "Schema decisions. API contracts. Trade-offs documented.",
    detail:
      "I sketch the data model in SQL Server or Postgres first, write the API contract before any endpoint exists, and note down the trade-offs I'm making, not just the decision I landed on.",
  },
  {
    number: "02",
    title: "Engineer for Failure",
    summary: "Validation. Logging. Load testing.",
    detail:
      "External calls get a timeout and a retry policy instead of a bare try/catch. Input is validated at the boundary with FluentValidation or a schema library, and failures log enough context that I can debug them without reproducing them first.",
  },
  {
    number: "03",
    title: "Ship With Confidence",
    summary: "CI/CD. Monitoring. Iteration.",
    detail:
      "Tests run before a merge is allowed, and deploys ship automatically once they pass. After release, I check real usage and error logs, not just that the build succeeded, before calling it done.",
  },
];
