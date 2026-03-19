import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Handlebars from "handlebars";
import type { ProjectConfig, TemplateFile } from "./types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the absolute path to the templates/ directory. */
export function getTemplatesDir(): string {
  // import.meta.url points to the compiled JS file inside dist/.
  // Package layout: <root>/dist/engine.js  →  <root>/templates/
  const thisFile = fileURLToPath(import.meta.url);
  const distDir = path.dirname(thisFile);
  const packageRoot = path.dirname(distDir);
  return path.join(packageRoot, "templates");
}

// ---------------------------------------------------------------------------
// Handlebars custom helpers — registered once at module load
// ---------------------------------------------------------------------------

Handlebars.registerHelper("eq", (a: unknown, b: unknown): boolean => a === b);

Handlebars.registerHelper("neq", (a: unknown, b: unknown): boolean => a !== b);

Handlebars.registerHelper(
  "or",
  (...args: unknown[]): boolean => {
    // Handlebars appends an options object as the last argument.
    const values = args.slice(0, -1);
    return values.some(Boolean);
  },
);

Handlebars.registerHelper(
  "includes",
  (haystack: unknown, needle: unknown): boolean => {
    if (typeof haystack === "string" && typeof needle === "string") {
      return haystack.includes(needle);
    }
    return false;
  },
);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Read a .hbs template file from the templates/ directory and render it
 * with the given project config as Handlebars context.
 *
 * @param templatePath - Path relative to the templates/ directory.
 * @param config - Project configuration used as Handlebars context.
 * @returns The rendered string.
 */
export function renderTemplate(
  templatePath: string,
  config: ProjectConfig,
): string {
  const templatesDir = getTemplatesDir();
  const absolutePath = path.join(templatesDir, templatePath);
  const source = fs.readFileSync(absolutePath, "utf-8");
  const compiled = Handlebars.compile(source);
  return compiled(config);
}

/**
 * Copy or render a list of template files into the project output directory.
 *
 * For each {@link TemplateFile}:
 * - If a `condition` is defined and returns false, the file is skipped.
 * - If the source ends with `.hbs`, the file is rendered with Handlebars and
 *   written without the `.hbs` extension.
 * - Otherwise the file is copied as-is.
 *
 * Parent directories are created automatically.
 *
 * @param config - Project configuration; `config.outputDir` is the root of
 *   the destination tree.
 * @param templateFiles - List of template file mappings to process.
 */
export async function copyTemplateFiles(
  config: ProjectConfig,
  templateFiles: TemplateFile[],
): Promise<void> {
  const templatesDir = getTemplatesDir();

  for (const file of templateFiles) {
    // Evaluate optional condition gate.
    if (file.condition !== undefined && !file.condition(config)) {
      continue;
    }

    // Resolve output path: the `output` field may itself contain Handlebars
    // expressions (e.g. `{{projectName}}/README.md`).
    const renderedOutput = Handlebars.compile(file.output)(config);
    const destPath = path.join(config.outputDir, renderedOutput);

    // Ensure parent directory exists.
    await fs.promises.mkdir(path.dirname(destPath), { recursive: true });

    const sourcePath = path.join(templatesDir, file.source);

    if (file.source.endsWith(".hbs")) {
      // Render template and strip the .hbs suffix from the destination.
      const source = await fs.promises.readFile(sourcePath, "utf-8");
      const compiled = Handlebars.compile(source);
      const rendered = compiled(config);
      // destPath already has the .hbs suffix removed because `output` should
      // not carry it; but if the caller included it, strip it defensively.
      const finalDest = destPath.endsWith(".hbs")
        ? destPath.slice(0, -4)
        : destPath;
      await fs.promises.writeFile(finalDest, rendered, "utf-8");
    } else {
      // Plain file — copy without modification.
      await fs.promises.copyFile(sourcePath, destPath);
    }
  }
}
