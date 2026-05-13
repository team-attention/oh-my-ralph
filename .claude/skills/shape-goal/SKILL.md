---
name: shape-goal
description: Use when the user wants to run a long-horizon Codex `/goal` (or any persistence-loop agent) against a Ralph-style repo and needs the goal *shaped* — stop condition pinned, qualitative outcome turned into a verifiable checklist, proxy fidelity declared, and durable memory files seeded. Trigger on "shape my goal", "set up /goal", "make this a /goal", "/goal from RALPH.md", "long-running goal", "ralph goal", "goal prompt", "stop condition", or whenever a user asks to convert a vague long-running task into a Codex `/goal` prompt. Reads `RALPH.md` when present, fills the four shape checks (Outcome / Stop / Proxy / Memory), refuses to emit a goal that would loop forever, and writes seed `PLAN.md` / `EXPERIMENTS.md` / `EXPERIMENT_NOTES.md` next to `RALPH.md` so the loop has a place to remember.
---

# Shape Goal

Ralph already defines a verifiable target (`RALPH.md` + `RALPH.png`). Codex `/goal` adds a long-horizon thread-level anchor on top. This skill is the bridge: it converts a Ralph-style spec (or a fuzzy intent) into a `/goal` prompt that **will actually terminate**, and it seeds the three memory files long-horizon runs need.

A `/goal` is not a longer prompt. It is a loop with a stop condition. If the stop condition is missing, the loop fails in one of two opposite ways:

1. **Early give-up** — the agent decides "looks done" after a few minutes.
2. **Never stops** — the agent edits in circles without converging.

Same root cause, opposite symptoms: the model is *inferring* when to stop. This skill exists to keep that inference out of the loop.

## When to invoke

- User says: "set up /goal", "shape my goal", "make this a /goal", "ralph + goal", "goal from RALPH.md".
- User pastes a long, vague target ("make the migration work", "improve the runtime", "build the demo") and wants Codex to run it long-horizon.
- A `RALPH.md` exists but the user wants to launch it through Codex `/goal` instead of OMX/OMC native ralph.
- Any time a stop condition needs to be made explicit before a long run starts.

Do NOT invoke for:
- One-shot questions or short edits.
- Tasks that should run via native Ralph/OMX/OMC/OmO without `/goal`.
- "Keep improving forever" requests — refuse and shape instead.

## The Four Shape Checks

Every shaped goal must pass these four checks before emission. If any one fails, the skill asks one targeted question to repair it. Do not emit a `/goal` with any check still open.

### 1. Outcome — one sentence

There is exactly one named outcome. Not a basket. Not "and also."

Bad: "improve the codebase and ship the migration and add tests"
Good: "the Stripe migration replaces PayPal in `src/payments/` with the existing test suite green"

### 2. Stop — a command or a checklist

The agent can run a deterministic check that returns done / not done.

Allowed forms:
- a shell command exit code (`npm run test:contract`, `pytest -k stripe`, `grep -c paypal src/ == 0`)
- a checklist file with N rows where the stop rule is "N/N rows checked"
- a manual verification with concrete observable state ("Stripe test card 4242… returns `payment_intent.succeeded` in logs")

Refused forms:
- "the code is better"
- "the architecture is cleaner"
- "the prose reads well"

When a qualitative target arrives, run the **Qualitative → Quantitative trick** (see below) before continuing.

### 3. Proxy — declared fidelity

If the validation in step 2 is slow, the agent will use a proxy (subset of tests, smaller model, smaller dataset). The shaped goal must say so explicitly:

- which proxy each iteration runs
- how often full validation is rerun against the proxy
- what divergence between proxy and real result triggers a stop-and-escalate

A fast proxy with no fidelity check is worse than a slow real validation — it converges fast in the wrong direction.

### 4. Memory — three files seeded

A multi-hour `/goal` outlives its context window. The shaped goal must reference and seed three files alongside `RALPH.md`:

- `PLAN.md` — current plan, next checkpoint
- `EXPERIMENT_NOTES.md` — scratchpad, present-tense thinking
- `EXPERIMENTS.md` — durable past: every attempt as one row (what / why / result / verdict)

`EXPERIMENTS.md` is the load-bearing one. Without it, the agent rediscovers dead ends after every compaction.

## Qualitative → Quantitative Trick

When the user's outcome is qualitative, do not refuse — extract a checklist.

Pattern:

```
qualitative target: "match ICML formatting"
extracted artifact: CHECKLIST.md with 200+ rows
each row: a single yes/no judgment the model can make reliably
new stop rule: every row marked done in CHECKLIST.md
```

Macro judgment becomes the sum of micro judgments. The model that cannot rate "is this paper ICML-shaped" can rate any single row.

When you trigger this trick, write the checklist file into the repo at `./CHECKLIST.md` (or a topic-specific name) and reference it as the stop rule in the emitted `/goal`. The agent itself can populate the checklist if a source-of-truth document exists (e.g. a style guide, a spec, a rubric).

## Core Loop

```
1. detect RALPH.md
   - if present: read Task, Constraints, Success Criteria, Verification Commands
   - if absent: ask for the one-sentence outcome first

2. run the four checks
   - Outcome → if multi-target, ask which one is the goal for this run
   - Stop → if qualitative, run Qualitative → Quantitative trick
   - Proxy → if validation > a few minutes, ask for proxy + fidelity policy
   - Memory → check / create PLAN.md, EXPERIMENT_NOTES.md, EXPERIMENTS.md

3. emit the shaped /goal
   - outcome-first, not process-first
   - includes the stop command, proxy policy, memory contract
   - copy-paste-able into a Codex thread

4. (optional) launch
   - if the user is inside Codex, hand the prompt to `/goal`
   - otherwise, print it and tell the user where to paste
```

## Operating Rules

- Read `RALPH.md` first when it exists. Do not re-ask what is already in it.
- Ask one repair question at a time, only for the failing check.
- Never emit a goal with an inferred stop condition. The user must approve the stop rule explicitly or the skill aborts.
- Prefer commands over prose for verification. `grep`, `pytest`, `npm run`, exit codes.
- When a checklist is generated, write it to disk. Do not keep it in the conversation.
- Seed memory files as empty templates with section headers — do not invent contents.
- Keep the emitted `/goal` under ~25 lines. Beyond that, the model is reading too much process.

## Output Format

The emitted goal follows this skeleton:

```text
/goal <one-sentence outcome>.

Success means:
- <observable behavior 1>
- <observable behavior 2>
- final answer includes: changed files, validation output, residual risk

Stop rule:
- <command or N/N checklist>

Proxy policy (if applicable):
- per-iteration: <fast check>
- every Nth iteration: <full validation>
- divergence > X% → pause and report

Memory:
- read EXPERIMENTS.md before proposing a new approach
- append one row to EXPERIMENTS.md after every attempt (success or fail)
- keep PLAN.md current; use EXPERIMENT_NOTES.md as scratchpad

Constraints:
- <from RALPH.md Constraints>

Do not:
- run more than <budget> iterations without rerunning full validation
- mark complete on proxy alone
```

## Memory File Templates

When seeding the three files, use these minimal templates so the agent has shape but no false content.

### `PLAN.md`

```markdown
# Plan

## Current outcome
<one sentence, copied from /goal>

## Next checkpoint
<the next observable thing that should be true>

## Backlog
- 
```

### `EXPERIMENT_NOTES.md`

```markdown
# Scratchpad

<append-only running thoughts. older notes stay; do not edit history.>
```

### `EXPERIMENTS.md`

```markdown
# Experiments

| # | When | Attempt | Why | Result | Verdict |
|---|------|---------|-----|--------|---------|
|   |      |         |     |        |         |
```

Verdict values: `kept`, `reverted`, `partial`, `dead-end`. The `dead-end` rows are the most valuable — they keep the loop from re-entering failed paths after context compaction.

## Internal State

Track this state while the skill runs:

```text
RALPH.md present:        yes / no
outcome (one sentence):
qualitative?             yes / no
checklist file:          path or none
validation command:
proxy used:              yes / no
proxy fidelity policy:
memory files present:    PLAN / NOTES / EXPERIMENTS
unresolved check:        Outcome / Stop / Proxy / Memory / none
```

When `unresolved check` becomes `none`, emit the `/goal` and stop.

## Refusal Conditions

The skill must refuse to emit a goal when:

- the outcome cannot be reduced to one sentence after one repair question
- the stop rule is qualitative and the user refuses to materialize a checklist
- the user wants to "keep improving forever" with no terminal state

Refusal message template:

```text
This goal would not terminate. The stop rule is <missing | qualitative | open-ended>.
A /goal without a terminal state will fail in one of two ways: it either gives up
early or never stops. Re-shape the outcome, or run this as an open exploration
instead of /goal.
```

## Relation to existing oh-my-ralph pieces

- `RALPH.md` — source of truth for Task / Constraints / Success Criteria. This skill reads it; it does not replace it.
- `RALPH.png` — visual contract. Untouched by this skill.
- `.ralph/prompts/codex-goal.md` — researched notes + five copy-paste `/goal` templates. This skill *uses* those templates as starting points; it does not duplicate them.
- Native ralph (OMX / OMC / OmO / Ouroboros) — runs the actual loop. `/goal` is an additional anchor for Codex specifically. This skill emits the goal; the native backend still executes.
