# vibescaffold

The vibe coder's project generator. Creates complete project scaffolds with AI configs, testing, CI/CD, and deployment in one command.

## Commands

```bash
npm run build       # Compile TypeScript
npm run dev         # Watch mode
npm run test        # Run vitest
npm run lint        # Biome check
npm run typecheck   # tsc --noEmit
```

## Architecture

- `src/cli.ts` — CLI entry point (Commander.js)
- `src/prompts.ts` — Interactive mode (Inquirer)
- `src/scaffold.ts` — Orchestrator: mkdir → render → install → git init
- `src/engine.ts` — Handlebars template engine
- `src/registry.ts` — Template definitions mapping templates to files
- `src/types.ts` — Shared TypeScript types
- `src/constants.ts` — Template choices and defaults
- `templates/` — Handlebars templates organized by template name + shared/

## Conventions

- ESM (`"type": "module"` in package.json)
- Node16 module resolution (`.js` extensions in imports)
- Strict TypeScript, no `any`
- `import type` for type-only imports
- Biome for linting and formatting
- Vitest for tests
