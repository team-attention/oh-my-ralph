import type { BaseAdapter, Spec } from "./base";
import { detectBinary } from "../utils/detect";

export class OpenAgentAdapter implements BaseAdapter {
	name = "openagent";

	async detect(): Promise<boolean> {
		const [hasCrush, hasOpencode] = await Promise.all([
			detectBinary("crush"),
			detectBinary("opencode"),
		]);
		return hasCrush || hasOpencode;
	}

	transform(spec: Spec): string {
		const lines: string[] = [];
		lines.push(`/ralph-loop "${spec.task}"`);

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

		return lines.join("\n");
	}

	async inject(_instructions: string): Promise<void> {
		// no-op
	}

	async launch(task: string): Promise<void> {
		const hasCrush = await detectBinary("crush");
		const binary = hasCrush ? "crush" : "opencode";
		const proc = Bun.spawn([binary, task], {
			stdio: ["inherit", "inherit", "inherit"],
		});
		await proc.exited;
	}
}
