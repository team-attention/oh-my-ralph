import { describe, expect, it } from "bun:test";
import { OuroborosAdapter } from "../../src/adapters/ouroboros";
import type { Spec } from "../../src/adapters/base";

describe("OuroborosAdapter", () => {
	const adapter = new OuroborosAdapter();

	it("has correct name", () => {
		expect(adapter.name).toBe("ouroboros");
	});

	it("transform includes ooo ralph prefix", () => {
		const spec: Spec = { task: "Build a CLI tool" };
		const result = adapter.transform(spec);
		expect(result).toContain("ooo ralph");
		expect(result).toContain("Build a CLI tool");
	});

	it("transform with full spec includes all sections", () => {
		const spec: Spec = {
			task: "Build a CLI tool",
			context: "Node.js environment",
			constraints: ["Must use TypeScript", "No external dependencies"],
		};
		const result = adapter.transform(spec);
		expect(result).toContain("ooo ralph");
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
