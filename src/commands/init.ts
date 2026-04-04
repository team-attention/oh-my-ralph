import { copyFile, access } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

function getTemplatesDir(): string {
	// Resolve relative to this source file: src/commands/init.ts → ../../templates
	const thisFile = fileURLToPath(import.meta.url);
	// thisFile = .../src/commands/init.ts
	// go up two levels to project root
	const srcDir = join(thisFile, "..", "..");
	return join(srcDir, "..", "templates");
}

export async function initSpec(targetDir: string, format: "md" | "yaml"): Promise<string> {
	const fileName = `spec.${format}`;
	const destPath = join(targetDir, fileName);

	// Check if file already exists
	try {
		await access(destPath);
		// If we reach here, file exists
		throw new Error(`${destPath} already exists`);
	} catch (err) {
		// If it's our "already exists" error, rethrow
		if (err instanceof Error && err.message.includes("already exists")) {
			throw err;
		}
		// Otherwise file doesn't exist, continue
	}

	const templatePath = join(getTemplatesDir(), fileName);
	await copyFile(templatePath, destPath);
	return destPath;
}
