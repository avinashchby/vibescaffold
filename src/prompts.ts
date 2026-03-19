import path from "node:path";
import inquirer from "inquirer";
import { TEMPLATE_CHOICES } from "./constants.js";
import type {
  AiTool,
  AuthOption,
  DatabaseOption,
  DeploymentTarget,
  LicenseType,
  PackageManager,
  ProjectConfig,
  TemplateName,
} from "./types.js";

/** Typed answers shape returned by the inquirer prompt sequence. */
interface PromptAnswers {
  projectName: string;
  template: TemplateName;
  packageManager: PackageManager;
  database: DatabaseOption;
  auth: AuthOption;
  deployment: DeploymentTarget;
  aiTools: AiTool;
}

/**
 * Optional prefill values from CLI flags.
 * When a value is provided it is used as the inquirer default (or skips the
 * prompt entirely when `when` is set to false).
 */
export interface PromptPrefills {
  name?: string;
  template?: TemplateName;
  pm?: PackageManager;
  database?: DatabaseOption;
  auth?: AuthOption;
  deployment?: DeploymentTarget;
  aiTools?: AiTool;
  license?: LicenseType;
  output?: string;
}

/** Regex for a valid npm package name: lowercase, no spaces, alphanumeric/hyphens/dots. */
const NPM_NAME_RE = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

/** Returns true when the string is a valid npm package name. */
function validateProjectName(input: string): true | string {
  if (!input.trim()) {
    return "Project name cannot be empty.";
  }
  if (/\s/.test(input)) {
    return "Project name must not contain spaces.";
  }
  if (input !== input.toLowerCase()) {
    return "Project name must be lowercase.";
  }
  if (!NPM_NAME_RE.test(input)) {
    return "Project name must be a valid npm package name (lowercase, alphanumeric, hyphens, dots).";
  }
  return true;
}

/**
 * Runs the interactive prompts and returns a fully-populated ProjectConfig.
 * Conditional questions (database, auth) are only shown for templates that
 * support them.
 */
export async function runInteractivePrompts(): Promise<ProjectConfig> {
  return runPrompts({});
}

/**
 * Runs the interactive prompts with optional CLI-flag prefills.
 * Prefilled values are used as inquirer defaults; questions whose value is
 * fully determined by a prefill are skipped.
 */
export async function runPrompts(prefills: PromptPrefills): Promise<ProjectConfig> {
  const answers = await inquirer.prompt<PromptAnswers>([
    {
      type: "input",
      name: "projectName",
      message: "Project name:",
      default: prefills.name,
      validate: validateProjectName,
      when: prefills.name === undefined,
    },
    {
      type: "list",
      name: "template",
      message: "Template:",
      default: prefills.template,
      choices: TEMPLATE_CHOICES.map((t) => ({
        name: `${t.name} — ${t.description}`,
        value: t.value,
        short: t.name,
      })),
      when: prefills.template === undefined,
    },
    {
      type: "list",
      name: "packageManager",
      message: "Package manager:",
      default: prefills.pm,
      choices: [
        { name: "npm", value: "npm" },
        { name: "pnpm  (faster installs, disk-efficient)", value: "pnpm" },
        { name: "yarn  (classic)", value: "yarn" },
        { name: "bun   (all-in-one runtime)", value: "bun" },
      ] satisfies Array<{ name: string; value: PackageManager }>,
      when: prefills.pm === undefined,
    },
    {
      type: "list",
      name: "database",
      message: "Database:",
      default: prefills.database,
      choices: [
        { name: "PostgreSQL", value: "postgres" },
        { name: "SQLite    (embedded, zero-config)", value: "sqlite" },
        { name: "MySQL", value: "mysql" },
        { name: "None", value: "none" },
      ] satisfies Array<{ name: string; value: DatabaseOption }>,
      when: (partial: Partial<PromptAnswers>): boolean => {
        if (prefills.database !== undefined) return false;
        const tpl = partial.template ?? prefills.template;
        return tpl === "nextjs" || tpl === "api";
      },
    },
    {
      type: "list",
      name: "auth",
      message: "Auth strategy:",
      default: prefills.auth,
      choices: (partial: Partial<PromptAnswers>) => {
        const tpl = partial.template ?? prefills.template;
        if (tpl === "nextjs") {
          return [
            { name: "NextAuth.js (OAuth, credentials, magic links)", value: "nextauth" },
            { name: "None", value: "none" },
          ] satisfies Array<{ name: string; value: AuthOption }>;
        }
        // api template
        return [
          { name: "JWT (stateless bearer tokens)", value: "jwt" },
          { name: "None", value: "none" },
        ] satisfies Array<{ name: string; value: AuthOption }>;
      },
      when: (partial: Partial<PromptAnswers>): boolean => {
        if (prefills.auth !== undefined) return false;
        const tpl = partial.template ?? prefills.template;
        return tpl === "nextjs" || tpl === "api";
      },
    },
    {
      type: "list",
      name: "deployment",
      message: "Deployment target:",
      default: prefills.deployment,
      choices: [
        { name: "Vercel   (serverless, edge)", value: "vercel" },
        { name: "Fly.io   (global containers)", value: "fly" },
        { name: "Railway  (instant deploys)", value: "railway" },
        { name: "Docker   (self-hosted)", value: "docker" },
        { name: "None", value: "none" },
      ] satisfies Array<{ name: string; value: DeploymentTarget }>,
      when: prefills.deployment === undefined,
    },
    {
      type: "list",
      name: "aiTools",
      message: "AI tool config:",
      default: prefills.aiTools,
      choices: [
        { name: "Claude Code (CLAUDE.md + .claude/)", value: "claude-code" },
        { name: "Cursor      (.cursorrules)", value: "cursor" },
        { name: "Windsurf    (.windsurfrules)", value: "windsurf" },
        { name: "All         (generate every AI config)", value: "all" },
      ] satisfies Array<{ name: string; value: AiTool }>,
      when: prefills.aiTools === undefined,
    },
  ]);

  // Merge answers with any prefilled values that bypassed prompting.
  const projectName = answers.projectName ?? (prefills.name as string);
  const template = answers.template ?? (prefills.template as TemplateName);
  const packageManager = answers.packageManager ?? (prefills.pm as PackageManager);
  const deployment = answers.deployment ?? (prefills.deployment as DeploymentTarget);
  const aiTools = answers.aiTools ?? (prefills.aiTools as AiTool);

  // database and auth default to "none" when the template doesn't use them.
  const database: DatabaseOption = answers.database ?? prefills.database ?? "none";
  const auth: AuthOption = answers.auth ?? prefills.auth ?? "none";

  const outputDir = prefills.output
    ? path.resolve(process.cwd(), prefills.output)
    : path.resolve(process.cwd(), projectName);

  return {
    projectName,
    template,
    packageManager,
    database,
    auth,
    deployment,
    aiTools,
    license: prefills.license ?? "MIT",
    outputDir,
  };
}
