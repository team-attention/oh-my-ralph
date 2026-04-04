export interface Spec {
	task: string;
	context?: string;
	constraints?: string[];
	successCriteria?: string[];
	raw?: string;
}

export interface BaseAdapter {
	name: string;
	detect(): Promise<boolean>;
	transform(spec: Spec): string;
	inject(instructions: string): Promise<void>;
	launch(task: string): Promise<void>;
}
