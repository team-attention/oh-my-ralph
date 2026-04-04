import { describe, expect, test } from "bun:test";
import { AdapterRegistry } from "../../src/core/adapter-registry";
import { runDoctor } from "../../src/commands/doctor";
import type { BaseAdapter, Spec } from "../../src/adapters/base";

function makeMockAdapter(name: string, available: boolean): BaseAdapter {
	return {
		name,
		detect: async () => available,
		transform: (_spec: Spec) => "",
		inject: async (_instructions: string) => {},
		launch: async (_task: string) => {},
	};
}

describe("runDoctor", () => {
	test("returns results for all registered adapters", async () => {
		const registry = new AdapterRegistry();
		registry.register(makeMockAdapter("adapter-a", true));
		registry.register(makeMockAdapter("adapter-b", false));

		const results = await runDoctor(registry);

		expect(results).toHaveLength(2);
	});

	test("correctly reports available adapter", async () => {
		const registry = new AdapterRegistry();
		registry.register(makeMockAdapter("available-one", true));

		const results = await runDoctor(registry);
		const result = results.find((r) => r.name === "available-one");

		expect(result).toBeDefined();
		expect(result?.available).toBe(true);
	});

	test("correctly reports unavailable adapter", async () => {
		const registry = new AdapterRegistry();
		registry.register(makeMockAdapter("missing-one", false));

		const results = await runDoctor(registry);
		const result = results.find((r) => r.name === "missing-one");

		expect(result).toBeDefined();
		expect(result?.available).toBe(false);
	});

	test("returns empty array when no adapters registered", async () => {
		const registry = new AdapterRegistry();
		const results = await runDoctor(registry);
		expect(results).toHaveLength(0);
	});

	test("returns correct name and available for mixed adapters", async () => {
		const registry = new AdapterRegistry();
		registry.register(makeMockAdapter("alpha", true));
		registry.register(makeMockAdapter("beta", false));
		registry.register(makeMockAdapter("gamma", true));

		const results = await runDoctor(registry);

		expect(results).toHaveLength(3);
		const names = results.map((r) => r.name);
		expect(names).toContain("alpha");
		expect(names).toContain("beta");
		expect(names).toContain("gamma");

		const alpha = results.find((r) => r.name === "alpha");
		const beta = results.find((r) => r.name === "beta");
		expect(alpha?.available).toBe(true);
		expect(beta?.available).toBe(false);
	});
});
