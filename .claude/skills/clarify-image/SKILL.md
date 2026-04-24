---
name: clarify-image
description: Use in Codex Plan mode when the user wants to clarify, shape, explore, visualize, or expand an idea through request_user_input choice questions and AI-generated image previews. Trigger on "clarify-image", "visualize my idea", "turn my idea into an image", "help me think through this visually", visual brainstorming, image-first ideation, or when the user wants Codex to ask structured multiple-choice questions, turn the answers into image previews, and use those images to make the idea clearer and stronger. This is a Plan-mode, request_user_input-based skill for Socratic idea clarification plus image generation, not for software implementation requirements.
---

# Clarify Image

Use Codex Plan mode to extract a fuzzy idea through `request_user_input`, then externalize the current understanding as an image. The image is a thinking artifact: it should reveal hidden assumptions, expose misunderstandings, and make the user's next choice sharper.

This skill is designed for Plan mode. Its normal interaction depends on `request_user_input`; Default mode can only approximate the flow and is not the intended experience.

## Core Loop

Use this loop:

```text
seed idea
-> identify core ambiguity
-> ask one request_user_input choice question
-> user selection
-> visual hypothesis
-> choose interpretation strength
-> background image generation
-> misunderstanding + expansion feedback
-> next question or revised image
```

Optimize for thought extraction and idea expansion, not image polish. A useful rough image that provokes "that part is wrong, but this part is stronger" is better than a generic polished image.

## Operating Rules

- Use `request_user_input` as the primary interaction method.
- Ask one high-leverage question at a time; never run a long intake form.
- Keep each cycle to at most 3 structured questions:
  1. core ambiguity question
  2. interpretation strength question before image generation
  3. misunderstanding + expansion feedback question after the image
- Use 2-3 mutually exclusive options per question, matching the Codex tool shape.
- Make options image-actionable: each selection should materially change the generated visual hypothesis.
- Do not start by asking about image craft details such as camera angle, style, or layout. Start by clarifying the user's thought.
- Use the `clarify` skill's AT-CoT/Socratic approach: classify the ambiguity, ask the question that resolves it, update the understanding, then check what ambiguity remains.
- Generate an image when one core ambiguity has been resolved and a useful visual hypothesis exists. Do not wait for a fixed number of answers.
- Ask for interpretation strength before each image unless the user has already specified it for this exact image.
- For image generation, follow the system `imagegen` skill and use the built-in `image_gen` path by default.
- If true async/background image jobs are available, use them. If not, call `image_gen` immediately and do not add explanatory text after the tool call.
- Treat every generated image as provisional. Use it to remove misunderstandings and strengthen the idea.

## Internal State

Track this working state internally:

```text
Original seed:
Current understanding:
Core ambiguity:
Ambiguity type:
Question type:
User selections:
Interpretation strength:
Visual hypothesis:
Image prompt:
Keep:
Change:
Learn:
Next ambiguity:
```

Do not dump this full state to the user unless they ask for a brief.

## Core Ambiguity

Before asking, classify the most important ambiguity. Use `clarify`-style ambiguity types:

| Type | Signal | Question target |
| --- | --- | --- |
| Intent | The purpose or desired effect is unclear | What the idea should reveal, change, or make possible |
| Meaning | A key concept is vague or overloaded | What the user's words mean in this context |
| Scope | The boundary is unclear | What is included, excluded, foregrounded, or ignored |
| Assumption | The user is relying on an unstated premise | What must be true for the idea to work |
| Viewpoint | The affected person or perspective is unclear | Whose experience the idea should serve |
| Implication | The consequence or tradeoff is unclear | What changes if this direction is chosen |
| Meta | The question itself may be wrong | Whether this is the right problem or framing |

The first question should usually clarify **Intent**. Do not ask first about subject, setting, mood, camera, or visual style unless the seed is already conceptually clear and only the visual form is missing.

## request_user_input Protocol

Use `request_user_input` for every material question in Plan mode.

Question requirements:

- Provide 1-3 short questions per tool call only when they are tightly related.
- Prefer 1 question when the next answer will change the next question.
- Each question must have 2-3 meaningful options.
- Put the recommended option first and suffix its label with `(Recommended)`.
- Use option descriptions to explain the tradeoff in one sentence.
- Do not include an "Other" option; the client adds free-form Other automatically.

Default first question shape:

```text
header: "Intent"
question: "What should this idea reveal first when it becomes an image?"
options:
  - label: "Hidden purpose (Recommended)"
    description: "Show what the idea is really trying to accomplish."
  - label: "Core tension"
    description: "Show the conflict or pressure that makes the idea matter."
  - label: "Desired change"
    description: "Show what should become different if the idea works."
```

Default interpretation strength question:

```text
header: "Interpret"
question: "How strongly should I interpret your answer in the image?"
options:
  - label: "Middle interpretation (Recommended)"
    description: "Stay faithful to the answer while adding enough visual meaning to expand it."
  - label: "Literal"
    description: "Translate the answer almost directly into an image."
  - label: "Strong expansion"
    description: "Push the latent meaning into a bolder visual metaphor."
```

## Visual Hypothesis

After each user selection, update the visual hypothesis. Keep it short:

```markdown
Visual hypothesis:
- Clarified intent: ...
- Resolved ambiguity: ...
- Interpretation strength: ...
- Image-actionable direction: ...
- Must avoid: ...
```

Proceed to image generation when:

- one core ambiguity is resolved,
- the image-actionable direction is clear,
- the interpretation strength has been selected or can safely default to middle interpretation.

If the core ambiguity is still unresolved, ask the next `request_user_input` question instead of generating.

## Background Image Generation

Once generation is justified:

1. Convert the latest selections into the visual hypothesis.
2. Build the image prompt using the chosen interpretation strength.
3. Start image generation in the background if the platform supports it.
4. If only synchronous `image_gen` is available, call it directly.
5. After the image tool call, do not add explanation in the same assistant turn.
6. While a true background job is running, continue with the next ambiguity only if the interface allows the user to keep answering without losing the image result.

Use "background image generation" as a UX principle: the user should feel their choices keep moving the idea forward, not that they are waiting through a production pipeline.

## Image Prompt

Call `image_gen` through the `imagegen` skill's default built-in workflow. Use this prompt shape:

```text
Create an image that visualizes this clarified idea:
<one-sentence clarified idea>

Clarified intent: <what the idea should reveal/change/make possible>
Core ambiguity resolved: <what was clarified>
Interpretation strength: <literal | middle interpretation | strong expansion>
Visual direction: <image-actionable translation of the answer>
Composition: <only include if needed for meaning>
Mood: <only include if derived from the clarification>
Constraints: <must include / must avoid>
Text: <no text, or exact requested text only>
```

Interpretation strength rules:

- `Literal`: preserve the user's words and avoid extra metaphor.
- `Middle interpretation`: add practical visual meaning while staying recognizably faithful.
- `Strong expansion`: use a bolder metaphor or scene that amplifies the user's latent intent.

Do not invent brands, slogans, named people, logos, or exact UI copy unless the user requested them.

## Feedback Loop

After an image, use `request_user_input` to ask for misunderstanding + expansion feedback. Keep `Keep / Change / Learn` internally, but phrase the user question around what was wrong and what should grow.

Default feedback shape:

```text
header: "Feedback"
question: "What should the next version do?"
options:
  - label: "Fix misunderstanding (Recommended)"
    description: "Correct the part of the image that misread your idea."
  - label: "Expand the strongest part"
    description: "Keep the promising direction and make it more powerful."
  - label: "Change the framing"
    description: "Shift the underlying interpretation before generating again."
```

Update internal state:

```text
Keep: what remains useful
Change: what was misleading or wrong
Learn: what the image made clearer or stronger
Next ambiguity: what to ask or visualize next
```

Then either ask the next `request_user_input` question or generate a revised image. Prefer generation when the feedback is concrete enough to revise directly.

## Output Modes

Default mode is Plan-mode choice-led image preview.

Use another output mode only when it better extracts the idea:

- `prompt-only`: user wants a reusable image prompt.
- `directions`: user needs 2-3 visual directions before choosing.
- `brief`: user wants the clarified idea as a design/art brief.
- `diagram-spec`: relationships matter more than atmosphere.
- `ui-spec`: the idea is a product screen or interface concept.

## Self-Improvement Use

When using this skill to improve itself or another skill:

1. Treat the skill as the subject.
2. Identify the core ambiguity in the skill's intended behavior.
3. Use Plan mode `request_user_input` to resolve that ambiguity.
4. Convert the resolved ambiguity into a visual or procedural hypothesis.
5. Patch the skill text so the next Codex instance can execute the loop with less hidden inference.
6. Validate the skill path and YAML metadata after editing.

For this self-improvement mode, a literal generated image is optional. Use `brief` or `diagram-spec` mode if file edits are the more useful artifact.

## Codex-Specific Notes

- This skill is Plan-mode first. `request_user_input` is unavailable in Default mode, so Default mode is not the intended runtime.
- If the user invokes this skill outside Plan mode, explain briefly that the full interaction requires Plan mode and provide only a compact fallback if necessary.
- Do not spawn subagents unless the user explicitly asks for agents or parallel exploration.
- If the skill is stored under `/Users/bong/.codex/skills` only, it may be removed by the local Claude-to-Codex skill sync. Prefer storing durable user skills under `/Users/bong/team-attention/deep-thought/.claude/skills/<skill-name>` and linking them into Codex.
