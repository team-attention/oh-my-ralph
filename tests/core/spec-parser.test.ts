import { describe, expect, it } from "bun:test";
import { parseSpec } from "../../src/core/spec-parser";

describe("parseSpec - raw format", () => {
	it("parses raw content as task", () => {
		const spec = parseSpec("Do something useful", "raw");
		expect(spec.task).toBe("Do something useful");
		expect(spec.raw).toBe("Do something useful");
	});

	it("trims whitespace from raw content", () => {
		const spec = parseSpec("  trimmed task  \n", "raw");
		expect(spec.task).toBe("trimmed task");
	});

	it("throws if raw content is empty", () => {
		expect(() => parseSpec("   ", "raw")).toThrow();
	});
});

describe("parseSpec - yaml format", () => {
	it("parses basic yaml with task only", () => {
		const yaml = `task: Build a CLI tool`;
		const spec = parseSpec(yaml, "yaml");
		expect(spec.task).toBe("Build a CLI tool");
	});

	it("parses full yaml with all fields", () => {
		const yaml = `
task: Build a CLI tool
context: Node.js environment
constraints:
  - Must use TypeScript
  - No external dependencies
success_criteria:
  - Tests pass
  - Builds successfully
`.trim();
		const spec = parseSpec(yaml, "yaml");
		expect(spec.task).toBe("Build a CLI tool");
		expect(spec.context).toBe("Node.js environment");
		expect(spec.constraints).toEqual(["Must use TypeScript", "No external dependencies"]);
		expect(spec.successCriteria).toEqual(["Tests pass", "Builds successfully"]);
	});

	it("sets raw to original content", () => {
		const yaml = "task: hello world";
		const spec = parseSpec(yaml, "yaml");
		expect(spec.raw).toBe(yaml);
	});

	it("throws if yaml has no task field", () => {
		const yaml = "context: some context";
		expect(() => parseSpec(yaml, "yaml")).toThrow();
	});

	it("throws if task is empty string", () => {
		const yaml = 'task: ""';
		expect(() => parseSpec(yaml, "yaml")).toThrow();
	});
});

describe("parseSpec - md format", () => {
	it("parses task from # Task section", () => {
		const md = `# Task\nBuild a CLI tool`;
		const spec = parseSpec(md, "md");
		expect(spec.task).toBe("Build a CLI tool");
	});

	it("parses full markdown with all sections", () => {
		const md = `# Task
Build a CLI tool

# Context
Node.js environment with Bun runtime

# Constraints
- Must use TypeScript
- No external dependencies

# Success Criteria
- Tests pass
- Builds successfully`;

		const spec = parseSpec(md, "md");
		expect(spec.task).toBe("Build a CLI tool");
		expect(spec.context).toBe("Node.js environment with Bun runtime");
		expect(spec.constraints).toEqual(["Must use TypeScript", "No external dependencies"]);
		expect(spec.successCriteria).toEqual(["Tests pass", "Builds successfully"]);
	});

	it("sets raw to original content", () => {
		const md = "# Task\nhello";
		const spec = parseSpec(md, "md");
		expect(spec.raw).toBe(md);
	});

	it("throws if no # Task section", () => {
		const md = "# Context\nsome context";
		expect(() => parseSpec(md, "md")).toThrow();
	});

	it("throws if # Task section is empty", () => {
		const md = "# Task\n\n# Context\nsome context";
		expect(() => parseSpec(md, "md")).toThrow();
	});

	it("handles multiline task content", () => {
		const md = `# Task
Line one
Line two`;
		const spec = parseSpec(md, "md");
		expect(spec.task).toBe("Line one\nLine two");
	});

	it("parses constraints without other optional sections", () => {
		const md = `# Task
Do something

# Constraints
- constraint one`;
		const spec = parseSpec(md, "md");
		expect(spec.task).toBe("Do something");
		expect(spec.constraints).toEqual(["constraint one"]);
		expect(spec.context).toBeUndefined();
		expect(spec.successCriteria).toBeUndefined();
	});
});
