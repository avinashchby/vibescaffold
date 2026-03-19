import type { TemplateName, TemplateDefinition } from "./types.js";

// ---------------------------------------------------------------------------
// Shared file helpers — used across multiple templates
// ---------------------------------------------------------------------------

/** Shared files included in every template. */
const sharedFiles = [
  {
    source: "shared/.gitignore.hbs",
    output: ".gitignore",
  },
  {
    source: "shared/.env.example.hbs",
    output: ".env.example",
  },
  {
    source: "shared/CLAUDE.md.hbs",
    output: "CLAUDE.md",
    condition: (c: { aiTools: string }) =>
      c.aiTools === "claude-code" || c.aiTools === "all",
  },
  {
    source: "shared/.cursorrules.hbs",
    output: ".cursorrules",
    condition: (c: { aiTools: string }) =>
      c.aiTools === "cursor" || c.aiTools === "all",
  },
  {
    source: "shared/.windsurfrules.hbs",
    output: ".windsurfrules",
    condition: (c: { aiTools: string }) =>
      c.aiTools === "windsurf" || c.aiTools === "all",
  },
  {
    source: "shared/ci.yml.hbs",
    output: ".github/workflows/ci.yml",
  },
  {
    source: "shared/LICENSE.hbs",
    output: "LICENSE",
  },
  {
    source: "shared/README.md.hbs",
    output: "README.md",
  },
  {
    source: "shared/biome.json.hbs",
    output: "biome.json",
  },
  {
    source: "shared/docker/Dockerfile.hbs",
    output: "Dockerfile",
    condition: (c: { deployment: string }) => c.deployment !== "none",
  },
  {
    source: "shared/docker/docker-compose.yml.hbs",
    output: "docker-compose.yml",
    condition: (c: { deployment: string }) => c.deployment !== "none",
  },
];

/**
 * Central registry mapping each TemplateName to its TemplateDefinition.
 *
 * Every entry lists all files (template-specific + shared) that will be
 * rendered and written to the output directory during scaffolding.
 *
 * Conditional files receive a `condition` function that is evaluated at
 * scaffold-time against the resolved ProjectConfig.
 */
export const TEMPLATE_REGISTRY: Record<TemplateName, TemplateDefinition> = {
  // ---------------------------------------------------------------------------
  // Next.js — Next.js 14 + TypeScript + Tailwind + shadcn/ui + Prisma + NextAuth
  // ---------------------------------------------------------------------------
  nextjs: {
    name: "nextjs",
    displayName: "Next.js",
    description: "Next.js 14 + TypeScript + Tailwind + shadcn/ui + Prisma + NextAuth",
    files: [
      // Core config
      { source: "nextjs/package.json.hbs", output: "package.json" },
      { source: "nextjs/next.config.mjs.hbs", output: "next.config.mjs" },
      { source: "nextjs/tailwind.config.ts.hbs", output: "tailwind.config.ts" },
      { source: "nextjs/postcss.config.mjs.hbs", output: "postcss.config.mjs" },
      { source: "nextjs/vitest.config.ts.hbs", output: "vitest.config.ts" },
      { source: "nextjs/playwright.config.ts.hbs", output: "playwright.config.ts" },
      // App directory
      { source: "nextjs/src/app/layout.tsx.hbs", output: "src/app/layout.tsx" },
      { source: "nextjs/src/app/page.tsx.hbs", output: "src/app/page.tsx" },
      { source: "nextjs/src/app/page.test.tsx.hbs", output: "src/app/page.test.tsx" },
      { source: "nextjs/src/app/globals.css.hbs", output: "src/app/globals.css" },
      // Shared files
      { source: "shared/tsconfig.json.hbs", output: "tsconfig.json" },
      ...sharedFiles,
    ],
    dependencies: {
      next: "14.2.18",
      react: "^18.3.1",
      "react-dom": "^18.3.1",
      typescript: "^5.7.2",
      tailwindcss: "^3.4.17",
      postcss: "^8.4.49",
      autoprefixer: "^10.4.20",
    },
    devDependencies: {
      "@types/node": "^22.10.0",
      "@types/react": "^18.3.18",
      "@types/react-dom": "^18.3.5",
      vitest: "^2.1.8",
      "@vitejs/plugin-react": "^4.3.4",
      "@testing-library/react": "^16.1.0",
      "@testing-library/jest-dom": "^6.6.3",
      "@testing-library/user-event": "^14.5.2",
      jsdom: "^25.0.1",
      playwright: "^1.49.1",
      "@playwright/test": "^1.49.1",
    },
    postScaffoldCommands: ["npx shadcn@latest init --yes --defaults"],
  },

  // ---------------------------------------------------------------------------
  // API — Express + TypeScript + Zod + Prisma + JWT
  // ---------------------------------------------------------------------------
  api: {
    name: "api",
    displayName: "API",
    description: "Express + TypeScript + Prisma + Zod + JWT auth",
    files: [
      // Core config
      { source: "api/package.json.hbs", output: "package.json" },
      { source: "api/vitest.config.ts.hbs", output: "vitest.config.ts" },
      // Application source
      { source: "api/src/index.ts.hbs", output: "src/index.ts" },
      { source: "api/src/index.test.ts.hbs", output: "src/index.test.ts" },
      { source: "api/src/routes/health.ts.hbs", output: "src/routes/health.ts" },
      { source: "api/src/middleware/errorHandler.ts.hbs", output: "src/middleware/errorHandler.ts" },
      // Shared files
      { source: "shared/tsconfig.json.hbs", output: "tsconfig.json" },
      ...sharedFiles,
    ],
    dependencies: {
      express: "^4.21.2",
      zod: "^3.24.1",
      cors: "^2.8.5",
      helmet: "^8.0.0",
      dotenv: "^16.4.7",
    },
    devDependencies: {
      typescript: "^5.7.2",
      "@types/node": "^22.10.0",
      "@types/express": "^5.0.0",
      "@types/cors": "^2.8.17",
      vitest: "^2.1.8",
      supertest: "^7.0.0",
      "@types/supertest": "^6.0.2",
      tsx: "^4.19.2",
    },
  },

  // ---------------------------------------------------------------------------
  // CLI — TypeScript + Commander.js + npm publish workflow
  // ---------------------------------------------------------------------------
  cli: {
    name: "cli",
    displayName: "CLI",
    description: "TypeScript + Commander.js + npm publish workflow",
    files: [
      { source: "cli/package.json.hbs", output: "package.json" },
      { source: "cli/tsconfig.json.hbs", output: "tsconfig.json" },
      { source: "cli/vitest.config.ts.hbs", output: "vitest.config.ts" },
      { source: "cli/src/index.ts.hbs", output: "src/index.ts" },
      { source: "cli/src/cli.ts.hbs", output: "src/cli.ts" },
      { source: "cli/src/index.test.ts.hbs", output: "src/index.test.ts" },
      {
        source: "cli/.github/workflows/npm-publish.yml.hbs",
        output: ".github/workflows/npm-publish.yml",
      },
      ...sharedFiles,
    ],
    dependencies: {
      chalk: "^5.3.0",
      commander: "^12.1.0",
    },
    devDependencies: {
      "@types/node": "^22.10.0",
      tsx: "^4.19.2",
      typescript: "^5.7.2",
      vitest: "^2.1.8",
    },
  },

  // ---------------------------------------------------------------------------
  // React — Vite + React + TypeScript + Tailwind + shadcn/ui + React Router
  // ---------------------------------------------------------------------------
  react: {
    name: "react",
    displayName: "React",
    description: "Vite + React + TypeScript + Tailwind + shadcn/ui + React Router",
    files: [
      { source: "react/package.json.hbs", output: "package.json" },
      { source: "react/vite.config.ts.hbs", output: "vite.config.ts" },
      { source: "react/vitest.config.ts.hbs", output: "vitest.config.ts" },
      { source: "react/tailwind.config.ts.hbs", output: "tailwind.config.ts" },
      { source: "react/postcss.config.mjs.hbs", output: "postcss.config.mjs" },
      { source: "react/index.html.hbs", output: "index.html" },
      { source: "react/src/main.tsx.hbs", output: "src/main.tsx" },
      { source: "react/src/App.tsx.hbs", output: "src/App.tsx" },
      { source: "react/src/App.test.tsx.hbs", output: "src/App.test.tsx" },
      { source: "react/src/index.css.hbs", output: "src/index.css" },
      { source: "react/src/test-setup.ts.hbs", output: "src/test-setup.ts" },
      { source: "react/tsconfig.json.hbs", output: "tsconfig.json" },
      { source: "react/playwright.config.ts.hbs", output: "playwright.config.ts" },
      ...sharedFiles,
    ],
    dependencies: {
      react: "^18.3.1",
      "react-dom": "^18.3.1",
      "react-router-dom": "^6.28.0",
    },
    devDependencies: {
      "@playwright/test": "^1.49.0",
      "@testing-library/jest-dom": "^6.6.3",
      "@testing-library/react": "^16.1.0",
      "@testing-library/user-event": "^14.5.2",
      "@types/react": "^18.3.14",
      "@types/react-dom": "^18.3.5",
      "@vitejs/plugin-react": "^4.3.4",
      autoprefixer: "^10.4.20",
      jsdom: "^25.0.1",
      postcss: "^8.4.49",
      tailwindcss: "^3.4.16",
      typescript: "^5.7.2",
      vite: "^6.0.5",
      vitest: "^2.1.8",
    },
  },
};
