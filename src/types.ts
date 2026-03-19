/** Supported project templates. */
export type TemplateName = "nextjs" | "api" | "cli" | "react";

/** Supported package managers. */
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

/** Supported database options. */
export type DatabaseOption = "postgres" | "sqlite" | "mysql" | "none";

/** Supported auth options. */
export type AuthOption = "nextauth" | "jwt" | "none";

/** Supported deployment targets. */
export type DeploymentTarget = "vercel" | "fly" | "railway" | "docker" | "none";

/** Supported AI tool configs. */
export type AiTool = "claude-code" | "cursor" | "windsurf" | "all";

/** Supported license types. */
export type LicenseType = "MIT" | "Apache-2.0" | "GPL-3.0" | "BSD-3-Clause" | "ISC" | "UNLICENSED";

/** Full project configuration after prompts are answered. */
export interface ProjectConfig {
  projectName: string;
  template: TemplateName;
  packageManager: PackageManager;
  database: DatabaseOption;
  auth: AuthOption;
  deployment: DeploymentTarget;
  aiTools: AiTool;
  license: LicenseType;
  outputDir: string;
}

/** Template metadata for template registry. */
export interface TemplateDefinition {
  name: TemplateName;
  displayName: string;
  description: string;
  /** Files to generate. Key = output path (handlebars), value = template source path. */
  files: TemplateFile[];
  /** Dependencies to install. */
  dependencies: Record<string, string>;
  /** Dev dependencies to install. */
  devDependencies: Record<string, string>;
  /** Post-scaffold commands to run. */
  postScaffoldCommands?: string[];
}

/** A single template file mapping. */
export interface TemplateFile {
  /** Source template path relative to templates/ dir. */
  source: string;
  /** Output path relative to project root. Supports handlebars expressions. */
  output: string;
  /** Only include this file when a condition is met. */
  condition?: (config: ProjectConfig) => boolean;
}
