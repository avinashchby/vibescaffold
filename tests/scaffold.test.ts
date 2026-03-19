import { describe, it, expect, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { copyTemplateFiles } from "../src/engine.js";
import type { ProjectConfig, TemplateFile } from "../src/types.js";

const BASE_CONFIG: ProjectConfig = {
  projectName: "scaffold-test",
  template: "cli",
  packageManager: "npm",
  database: "none",
  auth: "none",
  deployment: "none",
  aiTools: "all",
  license: "MIT",
  outputDir: "",
};

let tmpDir = "";

function makeTmpDir(): string {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vibescaffold-test-"));
  return tmpDir;
}

afterEach(() => {
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    tmpDir = "";
  }
});

describe("copyTemplateFiles", () => {
  it("renders .hbs files and writes output without .hbs extension", async () => {
    const dir = makeTmpDir();
    const config: ProjectConfig = { ...BASE_CONFIG, outputDir: dir };
    const files: TemplateFile[] = [
      { source: "shared/LICENSE.hbs", output: "LICENSE" },
    ];

    await copyTemplateFiles(config, files);

    const licenseContent = fs.readFileSync(
      path.join(dir, "LICENSE"),
      "utf-8",
    );
    expect(licenseContent).toContain("MIT");
    expect(licenseContent).toContain("scaffold-test");
  });

  it("skips files whose condition returns false", async () => {
    const dir = makeTmpDir();
    const config: ProjectConfig = {
      ...BASE_CONFIG,
      outputDir: dir,
      aiTools: "cursor",
    };
    const files: TemplateFile[] = [
      {
        source: "shared/CLAUDE.md.hbs",
        output: "CLAUDE.md",
        condition: (c) => c.aiTools === "claude-code" || c.aiTools === "all",
      },
    ];

    await copyTemplateFiles(config, files);

    expect(fs.existsSync(path.join(dir, "CLAUDE.md"))).toBe(false);
  });

  it("creates nested directories automatically", async () => {
    const dir = makeTmpDir();
    const config: ProjectConfig = { ...BASE_CONFIG, outputDir: dir };
    const files: TemplateFile[] = [
      { source: "shared/ci.yml.hbs", output: ".github/workflows/ci.yml" },
    ];

    await copyTemplateFiles(config, files);

    expect(
      fs.existsSync(path.join(dir, ".github", "workflows", "ci.yml")),
    ).toBe(true);
  });
});
