import { describe, expect, it } from "bun:test";
import { detectBinary } from "../../src/utils/detect";

describe("detectBinary", () => {
	it("returns true for bun (should exist in this environment)", async () => {
		const result = await detectBinary("bun");
		expect(result).toBe(true);
	});

	it("returns false for a nonexistent binary", async () => {
		const result = await detectBinary("__nonexistent_binary_xyz_12345__");
		expect(result).toBe(false);
	});

	it("returns true for sh (standard shell, always available)", async () => {
		const result = await detectBinary("sh");
		expect(result).toBe(true);
	});

	it("returns false for empty-string-like fake binary name", async () => {
		const result = await detectBinary("this-binary-does-not-exist-omr-test");
		expect(result).toBe(false);
	});
});
