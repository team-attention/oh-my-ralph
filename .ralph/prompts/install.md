# Install fallback

If `bash .ralph/bootstrap.sh <backend>` fails because a package name has changed or is unpublished, fall back to upstream:

| Backend | Upstream |
|---------|----------|
| omc | https://github.com/Yeachan-Heo/oh-my-claudecode |
| omx | https://github.com/Yeachan-Heo/oh-my-codex |
| omo | https://github.com/code-yeongyu/oh-my-openagent |
| ouroboros | https://github.com/Q00/ouroboros |

Procedure:
1. Read the upstream README or installation guide for the current install command.
2. Use the native setup path for that backend:
   - OMC: prefer Claude Code plugin install, then `/omc-setup`; npm fallback package is `oh-my-claude-sisyphus`.
   - OMX: install `@openai/codex` and `oh-my-codex`, then run `omx setup` and `omx doctor`.
   - OmO: fetch and follow `https://raw.githubusercontent.com/code-yeongyu/oh-my-openagent/refs/heads/dev/docs/guide/installation.md`. Verify with `command -v oh-my-opencode` and `oh-my-opencode doctor`, then run `oh-my-opencode install` inside the project to register the plugin. (`ultrawork` / `ulw` are in-session OpenCode keywords activated by a keyword-detector hook, not PATH binaries — never grep for them.)
   - Ouroboros: install from PyPI — package is `ouroboros-ai` (not `ouroboros`, not `ouroboros-cli`). Preferred: `pipx install ouroboros-ai && pipx inject ouroboros-ai claude-agent-sdk` (or with uv: `uv tool install ouroboros-ai --with claude-agent-sdk`). The `claude-agent-sdk` inject is required — `ouroboros-ai` does not ship with it and `ouroboros run` will crash at complexity-analysis with `No module named 'claude_agent_sdk'`. Verify `command -v ouroboros`.
3. Verify with `command -v <tool>` and the backend's doctor/setup command where available.
4. If still failing, report the error to the user and stop. Do not invent commands.

Native Ralph handoffs:
- OMC: `/ralph "<task>"` inside Claude Code. Do not use `omc ralph`.
- OMX: `omx ralph "<task>"` for free-text input, or `omx ralph --prd` (requires a pre-authored `.omx/prd.json` file with `user_stories` array — see `dist/cli/__tests__/ralph-prd-smoke.test.js` in the oh-my-codex package for schema). Inside an OMX Codex session: `$ralph "<task>"`. **Headless/CI note:** Codex requires an interactive TTY and shows a one-time "Star on GitHub?" prompt on first run that aborts on EOF in non-TTY. Clear it by running `omx` once interactively before any automated ralph loop.
- OmO: in-session `/ralph-loop "<task>"` or `/ulw-loop "<task>"`; headless `opencode run --command ralph-loop "<task>"` or `oh-my-opencode run "<task>"`. Requires `opencode >= 1.4.0` — older versions crash the plugin with `fn3 is not a function`.
- Ouroboros: `ouroboros init` (Socratic interview → YAML seed in `~/.ouroboros/seeds/`) then `ouroboros run <seed>.yaml`. Ouroboros does not accept Markdown; treat `RALPH.md` as source material for the interview, not a direct input.
