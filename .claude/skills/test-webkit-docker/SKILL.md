---
name: test-webkit-docker
description: Fallback for running the WebKit-backed Playwright e2e projects (iPhone SE, iPhone 14, iPad Mini, iPad Pro 11 landscape) in the official Playwright Docker image, for use only if native `npx playwright test` fails on this host with a "Host system is missing dependencies to run browsers" error for WebKit. As of 2026-07-10, native WebKit runs fine on this host — try `npm run test:e2e` / native `npx playwright test` first.
---

# Test WebKit via Docker (fallback)

**Status as of 2026-07-10: not currently needed.** This host's Arch package updates since this skill was written brought in newer `libicu`/`libxml2` than the versions Playwright originally complained about missing, and native WebKit now launches and passes the full e2e suite directly (`npm run test:e2e` ran all four WebKit-backed projects — iPhone SE, iPhone 14, iPad Mini, iPad Pro 11 landscape — with real passing assertions, no Docker involved). `libflite1` is still absent on this host but apparently isn't required for these specs. Always try native first; only fall back to the Docker approach below if native WebKit throws the "Host system is missing dependencies to run browsers" error again (e.g. after a future system change reintroduces the gap).

Originally: this host (Arch Linux) couldn't satisfy WebKit's native system dependencies (`libicu74`, `libxml2`, `libflite1`, etc. — the `sudo apt-get`/`install-deps` remedy Playwright suggests doesn't apply on Arch). The fix was to run the WebKit projects inside the official Playwright Docker image instead, pointed at the dev server already running on the host via `--network host`. Keep this fallback below in case that regresses.

Chromium/Android-emulated projects (`Pixel 7`, `Galaxy S8`, `Desktop 1280/1440/1920`) don't need this — run those natively with `npx playwright test --project=...` (add `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1` if the host-requirements check itself complains).

## Step 1 — Make sure the dev server is running on :3000

Use the `start-dev-server` skill, or check directly:
```bash
lsof -i :3000 -sTCP:LISTEN
```

## Step 2 — Run the WebKit projects in Docker

```bash
docker run --rm --network host \
  -v "$(pwd)":/work -w /work \
  -e NEXTAUTH_URL=http://localhost:3000 \
  -e NEXTAUTH_SECRET=ci-test-secret-not-used-in-production \
  mcr.microsoft.com/playwright:v1.60.0-noble \
  npx playwright test \
    --project="iPhone SE" --project="iPhone 14" --project="iPad Mini" --project="iPad Pro 11 landscape" \
    --reporter=list
```

Notes on this command:
- `--network host` lets the container reach the dev server bound on the host's `localhost:3000`. Without it the container can't see the host's loopback interface.
- Pin the image tag to match the `@playwright/test` version in `package.json` (currently `v1.60.0-noble`) — a mismatched container/host Playwright version can produce protocol errors.
- Add `-g "<pattern>"` to scope to specific tests, same as native `npx playwright test`.
- Auth-flow specs (`signin`, `signup`, `forgotReset`, `middlewareGating`) are gated to run only on `Desktop 1280` in the spec files themselves, so they won't execute under these WebKit projects — no need to pass extra env for reCAPTCHA here.
- Don't try to reuse the host's `node_modules`/native addons across the container boundary for anything beyond Playwright itself — a prior attempt to run tests requiring `better-sqlite3` (auth specs) inside this container failed with a `NODE_MODULE_VERSION` mismatch between host-compiled and container Node ABIs. This WebKit-only invocation avoids that because these projects don't touch the sqlite-backed auth helpers.

## Step 3 — Fix root-owned output files

The container runs as root by default, so anything it writes into the bind-mounted `test-results/` (traces, `.last-run.json`) ends up root-owned on the host and will cause `EACCES` on the next native Playwright run. Clean up after every Docker run:

```bash
sudo chown -R $(whoami):$(whoami) test-results/
```

## Notes

- This container approach is specifically for local iteration on this Arch host. CI (`.github/workflows/test.yml`) runs on Ubuntu runners with `npx playwright install --with-deps chromium webkit`, so it doesn't need this workaround — the two environments diverge only here.
- `docker pull mcr.microsoft.com/playwright:v1.60.0-noble` once up front if the image isn't cached; subsequent runs reuse it.
