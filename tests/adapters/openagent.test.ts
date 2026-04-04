import { describe, expect, it } from "bun:test";
import { OpenAgentAdapter } from "../../src/adapters/openagent";
import type { Spec } from "../../src/adapters/base";

describe("OpenAgentAdapter", () => {
	const adapter = new OpenAgentAdapter();

	it("has correct name", () => {
		expect(adapter.name).toBe("openagent");
	});

	it("transform includes /ralph-loop prefix", () => {
		const spec: Spec = { task: "Build a CLI tool" };
		const result = adapter.transform(spec);
		expect(result).toContain("/ralph-loop");
		expect(result).toContain("Build a CLI tool");
	});

	it("transform with full spec includes all sections", () => {
		const spec: Spec = {
			task: "Build a CLI tool",
			context: "Node.js environment",
			constraints: ["Must use TypeScript", "No external dependencies"],
		};
		const result = adapter.transform(spec);
		expect(result).toContain("/ralph-loop");
		expect(result).toContain("Build a CLI tool");
		expect(result).toContain("Context:");
		expect(result).toContain("Node.js environment");
		expect(result).toContain("Constraints:");
		expect(result).toContain("Must use TypeScript");
	});

	it("inject is a no-op", async () => {
		await expect(adapter.inject("any instructions")).resolves.toBeUndefined();
	});
});
