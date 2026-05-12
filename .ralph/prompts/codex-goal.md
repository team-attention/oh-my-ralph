# Codex `/goal` prep

Use this when the runtime is Codex and the user wants a long-running, multi-turn
task to stay anchored. `/goal` is a native Codex goal surface, not a replacement
for Ralph, OMX, or `RALPH.md`.

## What current Codex goal mode provides

Based on OpenAI Codex docs and the merged upstream goal-mode PR series:

- Goals are persisted as thread-level state, with objective, status, budget, and
  usage accounting.
- The app-server exposes experimental `thread/goal/set`,
  `thread/goal/get`, and `thread/goal/clear` RPCs.
- Model-facing tools are intentionally narrow: inspect a goal, create one only
  when explicitly requested, and mark it complete. Pause, resume, clear, and
  replacement are user/runtime-controlled.
- The core runtime accounts token and wall-clock usage, can continue active
  goals when idle, soft-stops on budget exhaustion, pauses on interrupt, and can
  reactivate paused goals when a thread resumes.
- The TUI `/goal` command can show a summary, create or replace a goal, and
  run `/goal clear`, `/goal pause`, and `/goal unpause`.

Source notes:
- OpenAI Codex app-server docs list the experimental goal RPCs.
- openai/codex PRs #18073-#18077 added goal persistence, app-server API,
  model tools, core runtime behavior, and TUI UX.

## How `/goal` actually fails

`/goal` is not a longer prompt. It is a loop with a stop condition. Internally
it runs four steps:

1. `execute` — agent takes an action
2. `score` — result is scored
3. `check` — score is compared against the goal
4. `continue / terminate` — keep going or stop

The most common confusion is between `score` and `goal`. The model can score
its own output, but **"what score counts as done"** is set by the prompt. The
scale belongs to the model, the gradation belongs to you. A scale with no
gradation measures forever.

When the stop condition is missing, two opposite failure modes appear:

1. **Early give-up** — the agent works for a few minutes, decides "looks done,"
   and terminates.
2. **Never stops** — the agent keeps editing in circles without converging.

They look opposite but share one root cause: the model has to *infer* when to
stop. A conservative inference produces #1, an aggressive inference produces
#2. The fix is the same — write the stop condition into the goal.

> "Improve the code" has no stop condition.
> "Reduce runtime of `<file>` by 20% with no regression on existing tests" does.

## Making qualitative goals quantitative

Many real goals are qualitative ("ICML formatting compliance", "good prose",
"clean architecture"). The loop cannot terminate on a qualitative target.

The trick is to **extract a checklist** that converts the qualitative goal
into hundreds of micro yes/no judgments the model *can* answer.

Reference pattern: converting a NeurIPS paper to ICML format. Instead of
goal = "match ICML format", extract 200+ formatting rules from the ICML
LaTeX style files into a markdown checklist, then set:

> goal = "all 200 checklist items marked complete, with the checklist file
> updated as each item is verified."

The model cannot reliably judge "is this paper ICML-shaped" but it *can*
reliably judge any one row of the checklist. Macro judgment becomes the sum
of micro judgments.

When writing a `/goal` for Ralph, do the same: if the success criterion is
qualitative, materialize a checklist file in the repo and make completing it
the stop condition.

## Tight feedback loops with proxy fidelity

Long-horizon goals only work when each iteration produces a usable signal
fast. If validation takes a day, the loop converges slowly or wrong.

Use proxies — smaller data, smaller model size, subset of the test suite —
to keep iterations in minutes, not hours.

The risk: a fast proxy that does not correlate with the real target will
optimize the agent toward the wrong solution. Check proxy fidelity
occasionally by running the full validation, and surface this as part of the
goal:

- which proxy is used per iteration
- how often the full validation is rerun
- what divergence between proxy and real result should trigger a stop

## Long-horizon memory: three markdown files

A multi-hour or multi-day `/goal` run will outlive its own context window.
Codex compacts, but anything not written to disk is lost. Three lightweight
markdown files cover the three relevant time horizons:

- **`PLAN.md`** — future. The current high-level plan and the next checkpoint.
- **`EXPERIMENT_NOTES.md`** — present. The agent's running scratchpad while
  it works.
- **`EXPERIMENTS.md`** — past. One row per attempt: what was tried, what
  changed, what the result was, whether it succeeded.

Of the three, `EXPERIMENTS.md` is the most important. The most expensive
mistake in long-horizon work is **retrying a path that already failed**.
Without a durable record of attempts, the agent will rediscover the same
dead ends after context compaction.

When seeding a `/goal`, instruct the agent to:

- create or read these three files at the start
- append an `EXPERIMENTS.md` row after every meaningful attempt, including
  failures
- consult `EXPERIMENTS.md` before proposing a new approach

This is the same pattern Ralph already encodes in `Risks & Unknowns` and
`Verification Commands` — surfacing learned constraints so the loop does
not re-enter them.

## When to use `/goal`

Good fit:
- multi-step coding work that may span interruptions or continuation turns
- debugging where root cause, fix, regression coverage, and validation must stay
  tied together
- migrations where scope control matters
- frontend work that must end with browser verification
- source-grounded research or docs where retrieval must not sprawl

Poor fit:
- one-shot questions
- tasks where the user has not actually asked to start a goal
- broad "keep improving forever" prompts with no stop rule
- goals without validation or a manual completion check

## Prompt rules

Use outcome-first goals. A strong `/goal` prompt should include:

- one clear outcome
- success criteria
- constraints
- retrieval or code-search budget when applicable
- validation loop
- stop rules

Avoid process-heavy chains like "first inspect A, then B, then C" unless the
order is a true invariant.

## Templates

### 1. Small code change

```text
/goal Ship the smallest correct code change for the requested feature or bug fix.

Success means:
- inspect repo instructions, ownership boundaries, and existing patterns before editing
- keep changes limited to files directly needed for the behavior
- implement the change end to end rather than stopping at a proposal
- run the most relevant validation: targeted tests first, then typecheck/build/lint when applicable
- final answer includes changed files, validation results, behavior delivered, and remaining blockers

Constraints:
- do not revert unrelated user changes
- ask only if a missing decision materially changes the implementation or creates meaningful risk
- prefer existing helpers and framework patterns over new abstractions

Stop rules:
- stop when the requested behavior is implemented and validated
- if validation cannot run, report the exact reason and the next best check performed
```

### 2. Regression diagnosis

```text
/goal Find the root cause of the reported failure, fix it at the narrowest responsible layer, and prove the regression is covered.

Success means:
- reproduce or inspect the failure before editing when feasible
- identify the specific code path, state transition, or dependency boundary causing it
- fix the root cause, not only the symptom
- add or update a focused regression test when the repo has a suitable test surface
- run the failing test or closest targeted validation after the fix
- final answer includes root cause, changed files, validation output, and residual risk

Search budget:
- start with the failing symbol, route, error text, or test name
- expand only if the first pass does not identify the responsible boundary

Stop rules:
- stop after the bug is fixed and relevant validation passes
- if the failure cannot be reproduced, state what was checked and the safest next diagnostic step
```

### 3. GPT-5.5 model or prompt migration

```text
/goal Migrate this project's active OpenAI model and directly related prompts to GPT-5.5 guidance without broad provider or architecture changes.

Success means:
- identify active model defaults and production prompt surfaces before editing
- preserve explicit non-target model choices, fixtures, historical docs, eval baselines, and fallback paths unless they are clearly active defaults
- rewrite prompts to be outcome-first, shorter, and validation-oriented
- add retrieval budgets, missing-evidence behavior, and stopping conditions where the prompt uses tools or citations
- run the most relevant validation available for changed files
- final answer includes model changes, prompt changes, validation results, and anything intentionally left unchanged

Constraints:
- use official OpenAI guidance when current docs are needed
- do not invent API changes, pricing, availability, or unsupported parameters
- stop and ask if the migration requires schema, SDK, provider, auth, or tool-handler rewiring
```

### 4. Frontend build with browser verification

```text
/goal Build the requested frontend experience as a usable first screen, consistent with the existing app's design system and interaction patterns.

Success means:
- inspect existing routes, components, styling conventions, and validation commands before editing
- implement the actual workflow, not a marketing landing page or placeholder UI
- include expected controls, loading/empty/error states, and responsive behavior
- verify desktop and mobile layouts in a browser when the app can run locally
- check for clipping, overlap, horizontal overflow, broken assets, and nonfunctional primary actions
- final answer includes changed files, local URL if a server is running, browser checks, and validation results

Constraints:
- avoid nested cards, generic heroes, decorative gradients, and visible instructional copy
- keep text readable and contained at mobile and desktop sizes
- use existing icon/component libraries when available

Stop rules:
- stop when the UI works in-browser and validation passes
- if browser verification is blocked, report why and provide the closest completed check
```

### 5. Source-grounded research or documentation

```text
/goal Produce a source-grounded answer or document that directly resolves the user's request.

Success means:
- use the provided source material as the primary anchor
- retrieve only the minimum additional evidence needed for unsupported factual claims
- distinguish source-backed facts from inference, assumptions, and creative framing
- preserve user-provided thesis, hook, terminology, or required wording unless there is a clear conflict
- final output is ready to use in the requested format, with concise caveats where evidence is partial

Retrieval budget:
- start with one focused search or the specific provided artifact
- search again only if a required fact, date, owner, quote, or citation is missing
- do not retrieve more just to improve phrasing

Stop rules:
- answer once the core request is supported by enough evidence
- if evidence is insufficient, use placeholders or clearly labeled assumptions instead of inventing specifics
```

