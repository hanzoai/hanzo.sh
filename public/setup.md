# Set up Hanzo on this machine

You are a coding agent (Claude Code, Codex, Cursor or Antigravity) and your user asked you to set up Hanzo. This page is the whole procedure: install the CLI, then hand over to the user. Do the steps in order and stop where it says stop.

## Rules

- Never ask for, read, type, print or store the user's password, tokens or API keys. Sign-in happens in the user's browser and the user completes it.
- Run only the commands on this page. Do not edit shell profiles, MCP settings or other tools' config by hand: the `hanzo` CLI does that, once the user runs it.
- Do not use `sudo`. The installer writes to `~/.local/bin` (Windows: the user's profile) and needs no elevation.
- If a command fails, show the user its output and stop. Do not try other installers.

## 1. Install the CLI

Pick the installer for the OS you are running on. Check with `uname -s` (`Darwin` is macOS, `Linux` is Linux) or, in PowerShell, `$env:OS`.

macOS, Linux and WSL:

```sh
curl -fsSL hanzo.sh | sh
```

Windows: the PowerShell installer is not published yet. If you are in WSL, use the command above. On native Windows, tell the user: "Hanzo's Windows installer is not live yet. Install WSL, or come back to this page when it is." Then stop.

The installer downloads one prebuilt binary per tool, checks its sha256, and puts `hanzo` in `~/.local/bin`. Check it:

```sh
hanzo --version
```

If the shell says `hanzo: command not found`, put the install directory on the PATH of this shell session only, and check again:

```sh
export PATH="$HOME/.local/bin:$PATH"
hanzo --version
```

## 2. Hand over to the user (stop here)

Do not run `hanzo` yourself. Its first run signs the user in through their browser and takes over the terminal, and neither is yours to do.

Tell the user, in these words or close to them:

> Hanzo is installed. Exit this session and run `hanzo` in your terminal.
> It signs you in through your browser (you finish that step), links this machine to Hanzo Tabs, asks once which coding agent is your favourite, adds Hanzo's tools to it, and launches it accelerated.

Then add:

> From then on, `hanzo` alone launches your favourite. `hanzo dev --claude`, `--codex`, `--cursor` or `--agy` switches it and saves the choice, and `hanzo -- -c` continues the last conversation, so to pick this one up, exit and run `hanzo -- -c`.

## What the plans give

Free is chat. Pro, $20, adds acceleration of your own coding tools and 2 Tabs. Max adds more Tabs and the local accelerator. Enterprise runs Kai and Enso locally. Details: https://docs.hanzo.ai/docs/quickstart#what-your-plan-unlocks

## Reference

- Docs: https://docs.hanzo.ai
- The coding tools, one page each: https://docs.hanzo.ai/docs/guides/coding
- The installer and what it installs: https://hanzo.sh/llms.txt
