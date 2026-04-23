# Install fallback

If `bash .ralph/bootstrap.sh <backend>` fails because a package name has changed or is unpublished, fall back to upstream:

| Backend | Upstream |
|---------|----------|
| omc | https://github.com/Yeachan-Heo/oh-my-claudecode |
| omx | https://github.com/Yeachan-Heo/oh-my-codex |
| omo | https://github.com/code-yeongyu/oh-my-openagent |
| ouroboros | https://github.com/Q00/ouroboros |

Procedure:
1. Read the upstream README for the current install command.
2. Try it.
3. Verify with `command -v <tool>` and `<tool> --version`.
4. If still failing, report the error to the user and stop. Do not invent commands.
