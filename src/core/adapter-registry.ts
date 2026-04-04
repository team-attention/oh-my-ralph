import type { BaseAdapter } from "../adapters/base";

export class AdapterRegistry {
	private adapters: Map<string, BaseAdapter> = new Map();

	register(adapter: BaseAdapter): void {
		this.adapters.set(adapter.name, adapter);
	}

	get(name: string): BaseAdapter {
		const adapter = this.adapters.get(name);
		if (!adapter) {
			throw new Error(`Unknown backend: ${name}`);
		}
		return adapter;
	}

	list(): BaseAdapter[] {
		return Array.from(this.adapters.values());
	}

	async detectAvailable(): Promise<BaseAdapter[]> {
		const results = await Promise.all(
			this.list().map(async (adapter) => ({
				adapter,
				available: await adapter.detect(),
			})),
		);
		return results.filter((r) => r.available).map((r) => r.adapter);
	}
}
