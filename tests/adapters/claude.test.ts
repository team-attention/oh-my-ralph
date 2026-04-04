import { describe, expect, it } from "bun:test";
import { ClaudeAdapter } from "../../src/adapters/claude";
import type { Spec } from "../../src/adapters/base";

describe("ClaudeAdapter", () => {
	const adapter = new ClaudeAdapter();

	it("has correct name", () => {
		expect(adapter.name).toBe("claude");
	});

	it("transform includes ralph: prefix", () => {
		const spec: Spec = { task: "Build a CLI tool" };
		const result = adapter.transform(spec);
		expect(result).toContain("ralph:");
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
		expect(result).toContain("ralph:");
		expect(result).toContain("Build a CLI tool");
		expect(result).toContain("Context:");
		expect(result).toContain("Node.js environment");
		expect(result).toContain("Constraints:");
		expect(result).toContain("Must use TypeScript");
		expect(result).toContain("Success Criteria:");
		expect(result).toContain("Tests pass");
	});

	it("inject is a no-op", async () => {
		await expect(adapter.inject("any instructions")).resolves.toBeUndefined();
	});
});
