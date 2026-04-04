import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export interface OmrConfig {
	defaultBackend: string;
	specFormat: "md" | "yaml";
}

const DEFAULT_CONFIG: OmrConfig = {
	defaultBackend: "codex",
	specFormat: "md",
};

function resolveConfigDir(configDir?: string): string {
	return configDir ?? join(homedir(), ".omr");
}

export async function loadConfig(configDir?: string): Promise<OmrConfig> {
	const dir = resolveConfigDir(configDir);
	const filePath = join(dir, "config.json");

	try {
		const raw = await readFile(filePath, "utf-8");
		const parsed = JSON.parse(raw) as Partial<OmrConfig>;
		return { ...DEFAULT_CONFIG, ...parsed };
	} catch {
		return { ...DEFAULT_CONFIG };
	}
}

export async function saveConfig(configDir?: string, config?: OmrConfig): Promise<void> {
	const dir = resolveConfigDir(configDir);
	const filePath = join(dir, "config.json");
	const toWrite = config ?? DEFAULT_CONFIG;

	await mkdir(dir, { recursive: true });
	await writeFile(filePath, JSON.stringify(toWrite, null, 2), "utf-8");
}
