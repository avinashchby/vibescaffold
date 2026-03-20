# vibescaffold

The vibe coder's project generator — spin up a complete, production-ready project in one command.

## Quick Start

```bash
npx @avinashchby/vibescaffold
```

## What It Does

Starting a new project means wiring together configs for TypeScript, linting, testing, CI, Docker, deployment, and your AI editor — before writing a single line of product code. vibescaffold answers every question once (interactively or via flags), then generates the full project tree, installs dependencies, and commits an initial git history. It ships four opinionated templates (Next.js, Express API, React SPA, CLI tool), each pre-configured with Vitest tests, GitHub Actions CI, and AI editor configs for Claude Code, Cursor, and Windsurf.

## Features

- Four templates: Next.js 14, Express API, React + Vite, TypeScript CLI
- Interactive prompt mode or fully non-interactive via CLI flags
- AI editor configs generated per choice: `CLAUDE.md`, `.cursorrules`, `.windsurfrules`
- GitHub Actions CI workflow included in every project
- Dockerfile and `docker-compose.yml` generated when a deployment target is selected
- Choice of package manager: npm, pnpm, yarn, or bun
- Database, auth, and deployment options baked into templates at generation time
- Auto-runs dependency install and `git init` with an initial commit

## Usage

Run interactively — prompts guide you through every option:

```bash
npx @avinashchby/vibescaffold
```

Non-interactive: scaffold a Next.js app with pnpm, no database, Vercel deployment:

```bash
npx @avinashchby/vibescaffold --name my-app --template nextjs --pm pnpm --deployment vercel
```

Generate an Express API with SQLite and JWT auth:

```bash
npx @avinashchby/vibescaffold --name my-api --template api --database sqlite --auth jwt
```

Scaffold a React SPA into a custom output directory:

```bash
npx @avinashchby/vibescaffold --name my-spa --template react --output ~/projects/my-spa
```

Generate a CLI tool package with only Claude Code config:

```bash
npx @avinashchby/vibescaffold --name my-cli --template cli --ai-tools claude-code
```

All flags:

| Flag | Values | Default |
|---|---|---|
| `--template` | `nextjs \| api \| cli \| react` | prompted |
| `--name` | string | prompted |
| `--pm` | `npm \| pnpm \| yarn \| bun` | `npm` |
| `--database` | `postgres \| sqlite \| mysql \| none` | `none` |
| `--auth` | `nextauth \| jwt \| none` | `none` |
| `--deployment` | `vercel \| fly \| railway \| docker \| none` | `none` |
| `--ai-tools` | `claude-code \| cursor \| windsurf \| all` | `all` |
| `--license` | `MIT \| Apache-2.0 \| GPL-3.0 \| BSD-3-Clause \| ISC \| UNLICENSED` | `MIT` |
| `--output` | path | `./<name>` |

## Example Output

```
  ╔══════════════════════════════╗
  ║  vibescaffold                ║
  ║  vibe-code your next project  ║
  ╚══════════════════════════════╝

✔ Directory created: /Users/you/my-app
✔ Template resolved: Next.js
✔ Template files rendered.
✔ Dependencies installed.
✔ Git repository initialised.
ℹ Project ready at: /Users/you/my-app

  Project scaffolded successfully!
  Output: /Users/you/my-app
```

Generated file tree (Next.js example):

```
my-app/
├── .github/workflows/ci.yml
├── src/
│   └── app/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── page.test.tsx
│       └── globals.css
├── .env.example
├── .gitignore
├── CLAUDE.md
├── .cursorrules
├── .windsurfrules
├── biome.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── LICENSE
└── README.md
```

## Installation

```bash
npm install -g @avinashchby/vibescaffold
# or
npx @avinashchby/vibescaffold
```

Requires Node.js >= 18.

## License

MIT
