import type { BaseAdapter, Spec } from "./base";
import { detectBinary } from "../utils/detect";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export class CodexAdapter implements BaseAdapter {
	name = "codex";

	detect(): Promise<boolean> {
		return detectBinary("codex");
	}

	transform(spec: Spec): string {
		const lines: string[] = [];
		lines.push("# OMX Ralph persistence mode");
		lines.push("");
		lines.push("## Task");
		lines.push(spec.task);

		if (spec.context) {
			lines.push("");
			lines.push("## Context");
			lines.push(spec.context);
		}

		if (spec.constraints && spec.constraints.length > 0) {
			lines.push("");
			lines.push("## Constraints");
			for (const constraint of spec.constraints) {
				lines.push(`- ${constraint}`);
			}
		}

		if (spec.successCriteria && spec.successCriteria.length > 0) {
			lines.push("");
			lines.push("## Success Criteria");
			for (const criterion of spec.successCriteria) {
				lines.push(`- ${criterion}`);
			}
		}

		lines.push("");
		lines.push(
			"Keep working until ALL success criteria are met. Verify with tests/build/lint. If fails, fix and re-verify.",
		);

		return lines.join("\n");
	}

	async inject(instructions: string): Promise<void> {
		const dir = join(process.cwd(), ".omx", "ralph");
		await mkdir(dir, { recursive: true });
		await writeFile(join(dir, "session-instructions.md"), instructions, "utf-8");
	}

	async launch(task: string): Promise<void> {
		const instructionsFile = join(process.cwd(), ".omx", "ralph", "session-instructions.md");
		const proc = Bun.spawn(["codex", task], {
			env: {
				...process.env,
				OMX_RALPH_APPEND_INSTRUCTIONS_FILE: instructionsFile,
			},
			stdio: ["inherit", "inherit", "inherit"],
		});
		await proc.exited;
	}
}
