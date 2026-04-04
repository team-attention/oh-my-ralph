import { loadConfig, saveConfig } from "../utils/config";

const VALID_KEYS = ["default-backend", "spec-format"] as const;
type ConfigKey = (typeof VALID_KEYS)[number];

function assertValidKey(key: string): asserts key is ConfigKey {
	if (!VALID_KEYS.includes(key as ConfigKey)) {
		throw new Error(`Unknown config key: "${key}". Valid keys: ${VALID_KEYS.join(", ")}`);
	}
}

export async function setConfigValue(key: string, value: string): Promise<void> {
	assertValidKey(key);

	if (key === "spec-format" && value !== "md" && value !== "yaml") {
		throw new Error(`Invalid value for spec-format: "${value}". Must be "md" or "yaml".`);
	}

	const config = await loadConfig();

	if (key === "default-backend") {
		config.defaultBackend = value;
	} else if (key === "spec-format") {
		config.specFormat = value as "md" | "yaml";
	}

	await saveConfig(undefined, config);
}

export async function getConfigValue(key: string): Promise<string> {
	assertValidKey(key);

	const config = await loadConfig();

	if (key === "default-backend") {
		return config.defaultBackend;
	} else {
		return config.specFormat;
	}
}
