#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import type {
  ProjectConfig,
  TemplateName,
  PackageManager,
  DatabaseOption,
  AuthOption,
  DeploymentTarget,
  AiTool,
  LicenseType,
} from "./types.js";
import type { PromptPrefills } from "./prompts.js";
import { DEFAULTS } from "./constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Read package.json version at runtime. */
function getVersion(): string {
  const pkgPath = resolve(__dirname, "../package.json");
  const raw = readFileSync(pkgPath, "utf-8");
  const pkg = JSON.parse(raw) as { version: string };
  return pkg.version;
}

/** Print the welcome banner. */
function printBanner(): void {
  console.log(chalk.bold.cyan("\n  ╔══════════════════════════════╗"));
  console.log(
    chalk.bold.cyan("  ║  ") +
      chalk.bold.white("vibescaffold") +
      chalk.bold.cyan("                ║"),
  );
  console.log(
    chalk.bold.cyan("  ║  ") +
      chalk.dim("vibe-code your next project") +
      chalk.bold.cyan("  ║"),
  );
  console.log(chalk.bold.cyan("  ╚══════════════════════════════╝\n"));
}

/** Build a ProjectConfig from CLI flags, filling any missing values with defaults. */
function buildConfigFromFlags(
  name: string,
  template: TemplateName,
  opts: PromptPrefills,
): ProjectConfig {
  const outputDir = opts.output
    ? resolve(process.cwd(), opts.output)
    : resolve(process.cwd(), name);

  return {
    projectName: name,
    template,
    packageManager: opts.pm ?? DEFAULTS.packageManager,
    database: opts.database ?? DEFAULTS.database,
    auth: opts.auth ?? DEFAULTS.auth,
    deployment: opts.deployment ?? DEFAULTS.deployment,
    aiTools: opts.aiTools ?? DEFAULTS.aiTools,
    license: opts.license ?? DEFAULTS.license,
    outputDir,
  };
}

async function main(): Promise<void> {
  printBanner();

  const program = new Command();

  program
    .name("vibescaffold")
    .description("The vibe coder's project generator")
    .version(getVersion(), "-v, --version")
    .option("--template <name>", "template to use (nextjs|api|cli|react)")
    .option("--name <name>", "project name")
    .option("--pm <manager>", "package manager (npm|pnpm|yarn|bun)")
    .option("--database <db>", "database option (postgres|sqlite|mysql|none)")
    .option("--auth <auth>", "auth option (nextauth|jwt|none)")
    .option("--deployment <target>", "deployment target (vercel|fly|railway|docker|none)")
    .option("--ai-tools <tools>", "AI tools config (claude-code|cursor|windsurf|all)")
    .option("--license <type>", "license type (MIT|Apache-2.0|GPL-3.0|BSD-3-Clause|ISC|UNLICENSED)")
    .option("--output <dir>", "output directory (defaults to ./<name>)")
    .parse(process.argv);

  const opts = program.opts<{
    template?: string;
    name?: string;
    pm?: string;
    database?: string;
    auth?: string;
    deployment?: string;
    aiTools?: string;
    license?: string;
    output?: string;
  }>();

  let config: ProjectConfig;

  if (opts.template !== undefined && opts.name !== undefined) {
    // Non-interactive mode: both --template and --name supplied.
    config = buildConfigFromFlags(
      opts.name,
      opts.template as TemplateName,
      {
        pm: opts.pm as PackageManager | undefined,
        database: opts.database as DatabaseOption | undefined,
        auth: opts.auth as AuthOption | undefined,
        deployment: opts.deployment as DeploymentTarget | undefined,
        aiTools: opts.aiTools as AiTool | undefined,
        license: opts.license as LicenseType | undefined,
        output: opts.output,
      },
    );
  } else {
    // Interactive mode — delegate to prompts module.
    const { runPrompts } = await import("./prompts.js");
    config = await runPrompts({
      name: opts.name,
      template: opts.template as TemplateName | undefined,
      pm: opts.pm as PackageManager | undefined,
      database: opts.database as DatabaseOption | undefined,
      auth: opts.auth as AuthOption | undefined,
      deployment: opts.deployment as DeploymentTarget | undefined,
      aiTools: opts.aiTools as AiTool | undefined,
      license: opts.license as LicenseType | undefined,
      output: opts.output,
    });
  }

  const spinner = ora("Scaffolding your project…").start();

  try {
    const { scaffold } = await import("./scaffold.js");
    spinner.stop();
    await scaffold(config);
    console.log(chalk.green.bold("\n  Project scaffolded successfully!"));
    console.log(chalk.dim(`  Output: ${config.outputDir}\n`));
  } catch (err) {
    spinner.fail("Scaffold failed.");
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(`\n  Error: ${message}\n`));
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(chalk.red(`\nFatal: ${message}\n`));
  process.exit(1);
});
