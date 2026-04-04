import type { BaseAdapter, Spec } from "./base";
import { detectBinary } from "../utils/detect";

export class ClaudeAdapter implements BaseAdapter {
	name = "claude";

	detect(): Promise<boolean> {
		return detectBinary("claude");
	}

	transform(spec: Spec): string {
		const lines: string[] = [];
		lines.push(`ralph: ${spec.task}`);

		if (spec.context) {
			lines.push("");
			lines.push(`Context: ${spec.context}`);
		}

		if (spec.constraints && spec.constraints.length > 0) {
			lines.push("");
			lines.push("Constraints:");
			for (const constraint of spec.constraints) {
				lines.push(`- ${constraint}`);
			}
		}

		if (spec.successCriteria && spec.successCriteria.length > 0) {
			lines.push("");
			lines.push("Success Criteria:");
			for (const criterion of spec.successCriteria) {
				lines.push(`- ${criterion}`);
			}
		}

		return lines.join("\n");
	}

	async inject(_instructions: string): Promise<void> {
		// no-op: claude receives instructions via -p flag
	}

	async launch(task: string): Promise<void> {
		const proc = Bun.spawn(["claude", "-p", task], {
			stdio: ["inherit", "inherit", "inherit"],
		});
		await proc.exited;
	}
}
