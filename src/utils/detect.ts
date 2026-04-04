export async function detectBinary(name: string): Promise<boolean> {
	const proc = Bun.spawn(["which", name], {
		stdout: "ignore",
		stderr: "ignore",
	});
	const exitCode = await proc.exited;
	return exitCode === 0;
}
