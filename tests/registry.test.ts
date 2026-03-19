import { describe, it, expect } from "vitest";
import { TEMPLATE_REGISTRY } from "../src/registry.js";

describe("TEMPLATE_REGISTRY", () => {
  it("has all four templates", () => {
    expect(Object.keys(TEMPLATE_REGISTRY).sort()).toEqual([
      "api",
      "cli",
      "nextjs",
      "react",
    ]);
  });

  it.each(["nextjs", "api", "cli", "react"] as const)(
    "%s has non-empty files list",
    (name) => {
      const def = TEMPLATE_REGISTRY[name];
      expect(def.files.length).toBeGreaterThan(0);
    },
  );

  it.each(["nextjs", "api", "cli", "react"] as const)(
    "%s includes shared files (.gitignore, LICENSE, README)",
    (name) => {
      const outputs = TEMPLATE_REGISTRY[name].files.map((f) => f.output);
      expect(outputs).toContain(".gitignore");
      expect(outputs).toContain("LICENSE");
      expect(outputs).toContain("README.md");
    },
  );

  it.each(["nextjs", "api", "cli", "react"] as const)(
    "%s includes a package.json template",
    (name) => {
      const outputs = TEMPLATE_REGISTRY[name].files.map((f) => f.output);
      expect(outputs).toContain("package.json");
    },
  );

  it("nextjs has correct display name", () => {
    expect(TEMPLATE_REGISTRY.nextjs.displayName).toBe("Next.js");
  });

  it("conditional files have condition functions", () => {
    const claudeFile = TEMPLATE_REGISTRY.nextjs.files.find(
      (f) => f.output === "CLAUDE.md",
    );
    expect(claudeFile?.condition).toBeDefined();
  });
});
