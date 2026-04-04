import type { AdapterRegistry } from "../core/adapter-registry";

export interface DoctorResult {
	name: string;
	available: boolean;
}

export async function runDoctor(registry: AdapterRegistry): Promise<DoctorResult[]> {
	const adapters = registry.list();
	const results = await Promise.all(
		adapters.map(async (adapter) => ({
			name: adapter.name,
			available: await adapter.detect(),
		})),
	);
	return results;
}
