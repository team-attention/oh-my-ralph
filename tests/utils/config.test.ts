import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadConfig, saveConfig } from "../../src/utils/config";
import type { OmrConfig } from "../../src/utils/config";

let tempDir: string;

beforeEach(async () => {
	tempDir = await mkdtemp(join(tmpdir(), "omr-config-test-"));
});

afterEach(async () => {
	await rm(tempDir, { recursive: true, force: true });
});

describe("loadConfig", () => {
	it("returns defaults when config file does not exist", async () => {
		const config = await loadConfig(tempDir);
		expect(config.defaultBackend).toBe("codex");
		expect(config.specFormat).toBe("md");
	});

	it("loads config from file when it exists", async () => {
		const customConfig: OmrConfig = { defaultBackend: "cursor", specFormat: "yaml" };
		await saveConfig(tempDir, customConfig);

		const loaded = await loadConfig(tempDir);
		expect(loaded.defaultBackend).toBe("cursor");
		expect(loaded.specFormat).toBe("yaml");
	});

	it("uses ~/.omr as default configDir when not specified", async () => {
		// Just verify it doesn't throw — default path may or may not have a config
		const config = await loadConfig();
		expect(config).toHaveProperty("defaultBackend");
		expect(config).toHaveProperty("specFormat");
	});
});

describe("saveConfig", () => {
	it("writes config to config.json in the specified directory", async () => {
		const config: OmrConfig = { defaultBackend: "windsurf", specFormat: "yaml" };
		await saveConfig(tempDir, config);

		const loaded = await loadConfig(tempDir);
		expect(loaded.defaultBackend).toBe("windsurf");
		expect(loaded.specFormat).toBe("yaml");
	});

	it("uses default config when none provided", async () => {
		await saveConfig(tempDir);
		const loaded = await loadConfig(tempDir);
		expect(loaded.defaultBackend).toBe("codex");
		expect(loaded.specFormat).toBe("md");
	});

	it("overwrites existing config", async () => {
		await saveConfig(tempDir, { defaultBackend: "cursor", specFormat: "yaml" });
		await saveConfig(tempDir, { defaultBackend: "codex", specFormat: "md" });

		const loaded = await loadConfig(tempDir);
		expect(loaded.defaultBackend).toBe("codex");
		expect(loaded.specFormat).toBe("md");
	});
});
