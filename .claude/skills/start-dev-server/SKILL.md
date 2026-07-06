---
name: start-dev-server
description: Start the Next.js dev server (if it isn't already running) and open the dev instance in the browser. Use when asked to start/run/spin up the dev server, or to "load the dev instance" / "open the site locally" in the browser.
---

# Start Dev Server

Gets `npm run dev` running in the background and points the browser at it. Idempotent: safe to invoke even if the server is already up.

## Step 1 — Check if it's already running

```bash
lsof -i :3000 -sTCP:LISTEN
```

If that returns a process, skip straight to Step 3 (don't start a second server, it'll just fail to bind the port).

## Step 2 — Start it in the background

```bash
nohup npm run dev > /tmp/webtechhq-site-dev.log 2>&1 &
disown
sleep 3
cat /tmp/webtechhq-site-dev.log
```

Confirm the log shows `✓ Ready in ...` before moving on. `next dev` (Turbopack) binds `http://localhost:3000` per `package.json`'s `dev` script. If the log shows a port conflict or crash, read the full log and troubleshoot before continuing (e.g. a stale server from a previous session already holding the port, in which case Step 1 should have caught it — re-check `lsof`).

## Step 3 — Open it in the browser

Load the deferred Chrome tools if not already loaded (one batched `ToolSearch` call):
```
select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__tabs_create_mcp
```

1. `tabs_context_mcp` with `createIfEmpty: true` to get a tab (reuse an existing MCP tab only if the user explicitly asked for that; otherwise create a fresh one per the tool's own guidance).
2. `navigate` that tab to `http://localhost:3000`.

## Notes

- The log at `/tmp/webtechhq-site-dev.log` is a fixed path (not scratchpad-scoped) so a later invocation in a new session can still find and tail the same server's output.
- This starts the server; it does not stop it. Leave it running for the rest of the session unless the user asks to stop it.
