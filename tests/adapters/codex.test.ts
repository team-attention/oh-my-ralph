import { describe, expect, it } from "bun:test";
import { CodexAdapter } from "../../src/adapters/codex";
import type { Spec } from "../../src/adapters/base";

describe("CodexAdapter", () => {
	const adapter = new CodexAdapter();

	it("has correct name", () => {
		expect(adapter.name).toBe("codex");
	});

	it("transform with minimal spec", () => {
		const spec: Spec = { task: "Build a CLI tool" };
		const result = adapter.transform(spec);
		expect(result).toContain("# OMX Ralph persistence mode");
		expect(result).toContain("Build a CLI tool");
	});

	it("transform with full spec includes all sections", () => {
		const spec: Spec = {
			task: "Build a CLI tool",
			context: "Node.js environment",
			constraints: ["Must use TypeScript", "No external dependencies"],
			successCriteria: ["Tests pass", "Builds successfully"],
		};
		const result = adapter.transform(spec);
		expect(result).toContain("# OMX Ralph persistence mode");
		expect(result).toContain("Build a CLI tool");
		expect(result).toContain("Node.js environment");
		expect(result).toContain("Must use TypeScript");
		expect(result).toContain("No external dependencies");
		expect(result).toContain("Tests pass");
		expect(result).toContain("Builds successfully");
		expect(result).toContain("Keep working until ALL success criteria are met");
	});
});
