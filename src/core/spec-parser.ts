import YAML from "yaml";
import type { Spec } from "../adapters/base";

function parseBulletList(text: string): string[] {
	return text
		.split("\n")
		.map((line) => line.replace(/^[-*]\s+/, "").trim())
		.filter((line) => line.length > 0);
}

function parseMd(content: string): Spec {
	const raw = content;
	// Split on headings (lines starting with # )
	const sectionRegex = /^#\s+(.+)$/m;
	const parts = content.split(/^(?=#\s)/m);

	let task: string | undefined;
	let context: string | undefined;
	let constraints: string[] | undefined;
	let successCriteria: string[] | undefined;

	for (const part of parts) {
		const lines = part.split("\n");
		const heading = lines[0].match(sectionRegex);
		if (!heading) continue;

		const sectionName = heading[1].trim().toLowerCase();
		const body = lines.slice(1).join("\n").trim();

		if (sectionName === "task") {
			task = body;
		} else if (sectionName === "context") {
			context = body || undefined;
		} else if (sectionName === "constraints") {
			const items = parseBulletList(body);
			constraints = items.length > 0 ? items : undefined;
		} else if (sectionName === "success criteria") {
			const items = parseBulletList(body);
			successCriteria = items.length > 0 ? items : undefined;
		}
	}

	if (!task || task.length === 0) {
		throw new Error("Spec must have a non-empty task");
	}

	return {
		task,
		...(context !== undefined ? { context } : {}),
		...(constraints !== undefined ? { constraints } : {}),
		...(successCriteria !== undefined ? { successCriteria } : {}),
		raw,
	};
}

function parseYaml(content: string): Spec {
	const raw = content;
	const parsed = YAML.parse(content) as Record<string, unknown>;

	const task = parsed?.task;
	if (typeof task !== "string" || task.trim().length === 0) {
		throw new Error("Spec must have a non-empty task");
	}

	const context =
		typeof parsed.context === "string" && parsed.context.trim().length > 0
			? parsed.context
			: undefined;

	const constraints = Array.isArray(parsed.constraints)
		? (parsed.constraints as string[])
		: undefined;

	const successCriteria = Array.isArray(parsed.success_criteria)
		? (parsed.success_criteria as string[])
		: undefined;

	return {
		task: task.trim(),
		...(context !== undefined ? { context } : {}),
		...(constraints !== undefined ? { constraints } : {}),
		...(successCriteria !== undefined ? { successCriteria } : {}),
		raw,
	};
}

function parseRaw(content: string): Spec {
	const task = content.trim();
	if (task.length === 0) {
		throw new Error("Spec must have a non-empty task");
	}
	return { task, raw: content };
}

export function parseSpec(content: string, format: "md" | "yaml" | "raw"): Spec {
	switch (format) {
		case "md":
			return parseMd(content);
		case "yaml":
			return parseYaml(content);
		case "raw":
			return parseRaw(content);
	}
}
