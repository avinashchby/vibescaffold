import type { TemplateName } from "./types.js";

/** Template display metadata for interactive prompts. */
export const TEMPLATE_CHOICES: Array<{ name: string; value: TemplateName; description: string }> = [
  {
    name: "Next.js",
    value: "nextjs",
    description: "Next.js 14 + TypeScript + Tailwind + shadcn/ui + Prisma + NextAuth",
  },
  {
    name: "API",
    value: "api",
    description: "Express + TypeScript + Prisma + Zod + JWT auth",
  },
  {
    name: "CLI",
    value: "cli",
    description: "TypeScript + Commander.js + npm publish workflow",
  },
  {
    name: "React",
    value: "react",
    description: "Vite + React + TypeScript + Tailwind + shadcn/ui + React Router",
  },
];

/** Default project configuration. */
export const DEFAULTS = {
  packageManager: "npm" as const,
  database: "none" as const,
  auth: "none" as const,
  deployment: "none" as const,
  aiTools: "all" as const,
  license: "MIT" as const,
};
