import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { initSpec } from "../../src/commands/init";

describe("initSpec", () => {
	let tempDir: string;

	beforeEach(async () => {
		tempDir = await mkdtemp(join(tmpdir(), "omr-init-test-"));
	});

	afterEach(async () => {
		await rm(tempDir, { recursive: true, force: true });
	});

	test("creates spec.md in target directory", async () => {
		const result = await initSpec(tempDir, "md");
		expect(result).toBe(join(tempDir, "spec.md"));
		expect(existsSync(result)).toBe(true);
		const content = readFileSync(result, "utf-8");
		expect(content).toContain("# Task");
	});

	test("creates spec.yaml in target directory", async () => {
		const result = await initSpec(tempDir, "yaml");
		expect(result).toBe(join(tempDir, "spec.yaml"));
		expect(existsSync(result)).toBe(true);
		const content = readFileSync(result, "utf-8");
		expect(content).toContain("task:");
	});

	test("throws if spec.md already exists", async () => {
		await initSpec(tempDir, "md");
		await expect(initSpec(tempDir, "md")).rejects.toThrow("already exists");
	});

	test("throws if spec.yaml already exists", async () => {
		await initSpec(tempDir, "yaml");
		await expect(initSpec(tempDir, "yaml")).rejects.toThrow("already exists");
	});

	test("returns absolute path", async () => {
		const result = await initSpec(tempDir, "md");
		expect(result).toStartWith("/");
	});
});
