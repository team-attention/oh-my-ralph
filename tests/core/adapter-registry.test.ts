import { describe, expect, it } from "bun:test";
import type { BaseAdapter, Spec } from "../../src/adapters/base";
import { AdapterRegistry } from "../../src/core/adapter-registry";

function makeMockAdapter(name: string, available = true): BaseAdapter {
	return {
		name,
		detect: async () => available,
		transform: (spec: Spec) => `[${name}] ${spec.task}`,
		inject: async (_instructions: string) => {},
		launch: async (_task: string) => {},
	};
}

describe("AdapterRegistry", () => {
	it("registers and retrieves an adapter by name", () => {
		const registry = new AdapterRegistry();
		const adapter = makeMockAdapter("codex");
		registry.register(adapter);
		expect(registry.get("codex")).toBe(adapter);
	});

	it("throws when getting an unknown backend", () => {
		const registry = new AdapterRegistry();
		expect(() => registry.get("unknown")).toThrow("Unknown backend: unknown");
	});

	it("lists all registered adapters", () => {
		const registry = new AdapterRegistry();
		const a = makeMockAdapter("codex");
		const b = makeMockAdapter("cursor");
		registry.register(a);
		registry.register(b);
		const list = registry.list();
		expect(list).toHaveLength(2);
		expect(list).toContain(a);
		expect(list).toContain(b);
	});

	it("returns empty list when no adapters registered", () => {
		const registry = new AdapterRegistry();
		expect(registry.list()).toEqual([]);
	});

	it("detectAvailable returns only adapters where detect() returns true", async () => {
		const registry = new AdapterRegistry();
		registry.register(makeMockAdapter("available", true));
		registry.register(makeMockAdapter("unavailable", false));
		registry.register(makeMockAdapter("also-available", true));

		const available = await registry.detectAvailable();
		expect(available).toHaveLength(2);
		expect(available.map((a) => a.name)).toEqual(["available", "also-available"]);
	});

	it("detectAvailable returns empty array when none are available", async () => {
		const registry = new AdapterRegistry();
		registry.register(makeMockAdapter("none", false));
		const available = await registry.detectAvailable();
		expect(available).toEqual([]);
	});

	it("overwrites adapter when registering same name twice", () => {
		const registry = new AdapterRegistry();
		const first = makeMockAdapter("codex");
		const second = makeMockAdapter("codex");
		registry.register(first);
		registry.register(second);
		expect(registry.get("codex")).toBe(second);
		expect(registry.list()).toHaveLength(1);
	});
});
