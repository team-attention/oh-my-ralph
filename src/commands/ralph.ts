import type { AdapterRegistry } from "../core/adapter-registry";
import type { Spec } from "../adapters/base";

export async function buildRalphPipeline(
	registry: AdapterRegistry,
	backendName: string,
	spec: Spec,
): Promise<void> {
	const adapter = registry.get(backendName);

	const available = await adapter.detect();
	if (!available) {
		throw new Error(
			`Backend "${backendName}" is not available. Run \`omr doctor\` to check available backends.`,
		);
	}

	const instructions = adapter.transform(spec);
	await adapter.inject(instructions);
	await adapter.launch(instructions);
}
