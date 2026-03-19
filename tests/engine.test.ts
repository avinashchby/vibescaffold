import { describe, it, expect } from "vitest";
import path from "node:path";
import { getTemplatesDir, renderTemplate } from "../src/engine.js";
import type { ProjectConfig } from "../src/types.js";

const BASE_CONFIG: ProjectConfig = {
  projectName: "test-project",
  template: "api",
  packageManager: "npm",
  database: "postgres",
  auth: "jwt",
  deployment: "docker",
  aiTools: "all",
  license: "MIT",
  outputDir: "/tmp/test-project",
};

describe("getTemplatesDir", () => {
  it("returns a path ending in /templates", () => {
    const dir = getTemplatesDir();
    expect(dir.endsWith("templates")).toBe(true);
  });

  it("contains the shared directory", () => {
    const dir = getTemplatesDir();
    const fs = require("node:fs");
    expect(fs.existsSync(path.join(dir, "shared"))).toBe(true);
  });
});

describe("renderTemplate", () => {
  it("renders a shared template with config values", () => {
    const rendered = renderTemplate("shared/.env.example.hbs", BASE_CONFIG);
    expect(rendered).toContain("DATABASE_URL");
  });

  it("renders conditional sections based on config", () => {
    const withDb = renderTemplate("shared/.env.example.hbs", BASE_CONFIG);
    expect(withDb).toContain("DATABASE_URL");

    const noDb = renderTemplate("shared/.env.example.hbs", {
      ...BASE_CONFIG,
      database: "none",
    });
    expect(noDb).not.toContain("DATABASE_URL");
  });

  it("renders the project name in README", () => {
    const rendered = renderTemplate("shared/README.md.hbs", BASE_CONFIG);
    expect(rendered).toContain("test-project");
  });
});
