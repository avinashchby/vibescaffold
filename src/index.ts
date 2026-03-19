// Public API — re-export types, scaffold function, and template registry.

export type {
  ProjectConfig,
  TemplateName,
  PackageManager,
  DatabaseOption,
  AuthOption,
  DeploymentTarget,
  AiTool,
  LicenseType,
  TemplateDefinition,
  TemplateFile,
} from "./types.js";

export { scaffold } from "./scaffold.js";

export { TEMPLATE_CHOICES, DEFAULTS } from "./constants.js";
