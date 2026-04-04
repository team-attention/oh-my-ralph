import { describe, expect, test } from "bun:test";
import { AdapterRegistry } from "../../src/core/adapter-registry";
import { buildRalphPipeline } from "../../src/commands/ralph";
import type { BaseAdapter, Spec } from "../../src/adapters/base";

function makeMockAdapter(name: string, available: boolean): BaseAdapter & { calls: string[] } {
	const calls: string[] = [];
	return {
		name,
		calls,
		detect: async () => {
			calls.push("detect");
			return available;
		},
		transform: (spec: Spec) => {
			calls.push("transform");
			return `transformed:${spec.task}`;
		},
		inject: async (instructions: string) => {
			calls.push(`inject:${instructions}`);
		},
		launch: async (task: string) => {
			calls.push(`launch:${task}`);
		},
	};
}

const sampleSpec: Spec = {
	task: "build something cool",
};

describe("buildRalphPipeline", () => {
	test("calls detect, transform, inject, launch in order", async () => {
		const registry = new AdapterRegistry();
		const adapter = makeMockAdapter("test-backend", true);
		registry.register(adapter);

		await buildRalphPipeline(registry, "test-backend", sampleSpec);

		expect(adapter.calls[0]).toBe("detect");
		expect(adapter.calls[1]).toBe("transform");
		expect(adapter.calls[2]).toStartWith("inject:");
		expect(adapter.calls[3]).toStartWith("launch:");
	});

	test("inject receives output from transform", async () => {
		const registry = new AdapterRegistry();
		const adapter = makeMockAdapter("test-backend", true);
		registry.register(adapter);

		await buildRalphPipeline(registry, "test-backend", sampleSpec);

		const injectCall = adapter.calls.find((c) => c.startsWith("inject:"));
		expect(injectCall).toBe("inject:transformed:build something cool");
	});

	test("launch receives output from transform", async () => {
		const registry = new AdapterRegistry();
		const adapter = makeMockAdapter("test-backend", true);
		registry.register(adapter);

		await buildRalphPipeline(registry, "test-backend", sampleSpec);

		const launchCall = adapter.calls.find((c) => c.startsWith("launch:"));
		expect(launchCall).toBe("launch:transformed:build something cool");
	});

	test("throws when backend is not available, mentions omr doctor", async () => {
		const registry = new AdapterRegistry();
		const adapter = makeMockAdapter("unavailable-backend", false);
		registry.register(adapter);

		await expect(
			buildRalphPipeline(registry, "unavailable-backend", sampleSpec),
		).rejects.toThrow("omr doctor");
	});

	test("throws on unknown backend", async () => {
		const registry = new AdapterRegistry();

		await expect(buildRalphPipeline(registry, "nonexistent", sampleSpec)).rejects.toThrow(
			"Unknown backend",
		);
	});

	test("does not call transform/inject/launch when detect fails", async () => {
		const registry = new AdapterRegistry();
		const adapter = makeMockAdapter("unavailable", false);
		registry.register(adapter);

		try {
			await buildRalphPipeline(registry, "unavailable", sampleSpec);
		} catch {
			// expected
		}

		expect(adapter.calls).not.toContain("transform");
		expect(adapter.calls.some((c) => c.startsWith("inject"))).toBe(false);
		expect(adapter.calls.some((c) => c.startsWith("launch"))).toBe(false);
	});
});
