#!/usr/bin/env bun
import { program } from "commander";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { AdapterRegistry } from "../core/adapter-registry";
import { CodexAdapter } from "../adapters/codex";
import { ClaudeAdapter } from "../adapters/claude";
import { OpenAgentAdapter } from "../adapters/openagent";
import { OuroborosAdapter } from "../adapters/ouroboros";
import { parseSpec } from "../core/spec-parser";
import { loadConfig } from "../utils/config";
import { initSpec } from "../commands/init";
import { runDoctor } from "../commands/doctor";
import { buildRalphPipeline } from "../commands/ralph";
import { setConfigValue, getConfigValue } from "../commands/config";

// Build the registry with all adapters
const registry = new AdapterRegistry();
registry.register(new CodexAdapter());
registry.register(new ClaudeAdapter());
registry.register(new OpenAgentAdapter());
registry.register(new OuroborosAdapter());

// Read package.json for version
const pkgPath = new URL("../../package.json", import.meta.url);
let version = "0.1.0";
try {
	const pkg = JSON.parse(await readFile(pkgPath.pathname, "utf-8")) as { version: string };
	version = pkg.version;
} catch {
	// fallback
}

program
	.name("omr")
	.description("oh-my-ralph — meta CLI for running ralph persistence loops across coding agents")
	.version(version);

// omr ralph [task]
program
	.command("ralph [task]")
	.description("Run the ralph persistence loop using a backend agent")
	.option("-b, --backend <backend>", "Backend to use (codex|claude|openagent|ouroboros)")
	.option("-s, --spec <path>", "Path to spec file")
	.action(async (task: string | undefined, opts: { backend?: string; spec?: string }) => {
		try {
			const config = await loadConfig();
			const backendName = opts.backend ?? config.defaultBackend;

			let spec;
			if (task) {
				// Raw task string provided directly
				spec = parseSpec(task, "raw");
			} else {
				// Load from spec file
				const specPath =
					opts.spec ??
					(config.specFormat === "yaml"
						? join(process.cwd(), "spec.yaml")
						: join(process.cwd(), "spec.md"));
				const content = await readFile(specPath, "utf-8");
				const format = specPath.endsWith(".yaml") ? "yaml" : "md";
				spec = parseSpec(content, format);
			}

			await buildRalphPipeline(registry, backendName, spec);
		} catch (err) {
			console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
			process.exit(1);
		}
	});

// omr init
program
	.command("init")
	.description("Initialize a spec file in the current directory")
	.option("-f, --format <format>", "Spec format: md or yaml", "md")
	.action(async (opts: { format: string }) => {
		try {
			const format = opts.format === "yaml" ? "yaml" : "md";
			const filePath = await initSpec(process.cwd(), format);
			console.log(`Created ${filePath}`);
		} catch (err) {
			console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
			process.exit(1);
		}
	});

// omr doctor
program
	.command("doctor")
	.description("Check which backends are available")
	.action(async () => {
		try {
			const results = await runDoctor(registry);
			for (const result of results) {
				const icon = result.available ? "✓" : "✗";
				console.log(`  ${icon} ${result.name}`);
			}
		} catch (err) {
			console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
			process.exit(1);
		}
	});

// omr config set/get
const configCmd = program.command("config").description("Manage omr configuration");

configCmd
	.command("set <key> <value>")
	.description("Set a config value (keys: default-backend, spec-format)")
	.action(async (key: string, value: string) => {
		try {
			await setConfigValue(key, value);
			console.log(`Set ${key} = ${value}`);
		} catch (err) {
			console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
			process.exit(1);
		}
	});

configCmd
	.command("get <key>")
	.description("Get a config value (keys: default-backend, spec-format)")
	.action(async (key: string) => {
		try {
			const value = await getConfigValue(key);
			console.log(value);
		} catch (err) {
			console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
			process.exit(1);
		}
	});

program.parse();
