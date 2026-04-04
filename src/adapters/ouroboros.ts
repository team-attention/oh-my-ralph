import type { BaseAdapter, Spec } from "./base";
import { detectBinary } from "../utils/detect";

export class OuroborosAdapter implements BaseAdapter {
	name = "ouroboros";

	detect(): Promise<boolean> {
		return detectBinary("ouroboros");
	}

	transform(spec: Spec): string {
		const lines: string[] = [];
		lines.push(`ooo ralph "${spec.task}"`);

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
		const proc = Bun.spawn(["ouroboros", "ralph", task], {
			stdio: ["inherit", "inherit", "inherit"],
		});
		await proc.exited;
	}
}
