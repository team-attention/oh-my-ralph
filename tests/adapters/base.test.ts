import { describe, expect, it } from "bun:test";
import type { BaseAdapter, Spec } from "../../src/adapters/base";

describe("Spec type", () => {
	it("accepts minimal spec with only task", () => {
		const spec: Spec = { task: "Build a CLI tool" };
		expect(spec.task).toBe("Build a CLI tool");
		expect(spec.context).toBeUndefined();
		expect(spec.constraints).toBeUndefined();
		expect(spec.successCriteria).toBeUndefined();
		expect(spec.raw).toBeUndefined();
	});

	it("accepts full spec with all fields", () => {
		const spec: Spec = {
			task: "Build a CLI tool",
			context: "Node.js environment",
			constraints: ["Must use TypeScript", "No external dependencies"],
			successCriteria: ["Tests pass", "Builds successfully"],
			raw: "original raw content",
		};
		expect(spec.task).toBe("Build a CLI tool");
		expect(spec.context).toBe("Node.js environment");
		expect(spec.constraints).toEqual(["Must use TypeScript", "No external dependencies"]);
		expect(spec.successCriteria).toEqual(["Tests pass", "Builds successfully"]);
		expect(spec.raw).toBe("original raw content");
	});
});

describe("BaseAdapter interface", () => {
	it("can be satisfied by a conforming object", async () => {
		const mockAdapter: BaseAdapter = {
			name: "mock",
			detect: async () => true,
			transform: (spec: Spec) => `Task: ${spec.task}`,
			inject: async (_instructions: string) => {},
			launch: async (_task: string) => {},
		};

		expect(mockAdapter.name).toBe("mock");
		expect(await mockAdapter.detect()).toBe(true);
		expect(mockAdapter.transform({ task: "hello" })).toBe("Task: hello");
		await expect(mockAdapter.inject("instructions")).resolves.toBeUndefined();
		await expect(mockAdapter.launch("task")).resolves.toBeUndefined();
	});

	it("detect can return false", async () => {
		const unavailableAdapter: BaseAdapter = {
			name: "unavailable",
			detect: async () => false,
			transform: (_spec: Spec) => "",
			inject: async (_instructions: string) => {},
			launch: async (_task: string) => {},
		};

		expect(await unavailableAdapter.detect()).toBe(false);
	});
});
