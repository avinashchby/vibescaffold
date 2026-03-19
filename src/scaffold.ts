import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import ora from "ora";
import type { ProjectConfig } from "./types.js";

const execFileAsync = promisify(execFile);

/** Run a shell command inside `cwd`. Rejects with the stderr message on failure. */
async function run(
  cmd: string,
  args: string[],
  cwd: string,
): Promise<void> {
  await execFileAsync(cmd, args, { cwd });
}

/** Install dependencies using the configured package manager. */
async function installDependencies(config: ProjectConfig): Promise<void> {
  const installArgs: Record<typeof config.packageManager, string[]> = {
    npm: ["install"],
    pnpm: ["install"],
    yarn: ["install"],
    bun: ["install"],
  };
  await run(config.packageManager, installArgs[config.packageManager], config.outputDir);
}

/** Initialise a git repository and create an initial commit. */
async function initGit(config: ProjectConfig): Promise<void> {
  const { outputDir, projectName } = config;
  await run("git", ["init"], outputDir);
  await run("git", ["add", "-A"], outputDir);
  await run(
    "git",
    ["commit", "--allow-empty", "-m", `chore: init ${projectName}`],
    outputDir,
  );
}

/**
 * Orchestrate the full project scaffold.
 *
 * Steps:
 *  1. Create the output directory.
 *  2. Look up the template definition from the registry.
 *  3. Copy/render template files via the template engine.
 *  4. Install dependencies with the configured package manager.
 *  5. Initialise a git repository.
 */
export async function scaffold(config: ProjectConfig): Promise<void> {
  const spinner = ora();

  // Step 1 — create output directory.
  spinner.start("Creating project directory…");
  await mkdir(config.outputDir, { recursive: true });
  spinner.succeed(`Directory created: ${config.outputDir}`);

  // Step 2 — resolve template definition from registry.
  spinner.start("Resolving template…");
  const { TEMPLATE_REGISTRY } = await import("./registry.js");
  const templateDef = TEMPLATE_REGISTRY[config.template];
  if (templateDef === undefined) {
    spinner.fail(`Unknown template: ${config.template}`);
    throw new Error(`No template registered for "${config.template}".`);
  }
  spinner.succeed(`Template resolved: ${templateDef.displayName}`);

  // Step 3 — copy / render template files.
  spinner.start("Rendering template files…");
  const { copyTemplateFiles } = await import("./engine.js");
  await copyTemplateFiles(config, templateDef.files);
  spinner.succeed("Template files rendered.");

  // Step 4 — install dependencies.
  spinner.start(`Installing dependencies with ${config.packageManager}…`);
  try {
    await installDependencies(config);
    spinner.succeed("Dependencies installed.");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    spinner.warn(`Dependency install skipped (${message}). Run manually.`);
  }

  // Step 5 — git init.
  spinner.start("Initialising git repository…");
  try {
    await initGit(config);
    spinner.succeed("Git repository initialised.");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    spinner.warn(`Git init skipped (${message}). Run manually.`);
  }

  spinner.info(`Project ready at: ${resolve(config.outputDir)}`);
}
