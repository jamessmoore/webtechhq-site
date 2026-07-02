#!/bin/bash
# Release-based atomic deploy, run on the EC2 host as the ubuntu user.
#
# - Clones the target branch into a fresh releases/<timestamp> directory
# - Builds there (the currently-live release is untouched while this runs)
# - Only on a successful build + health check does "current" get swapped
# - On health-check failure, rolls back the "current" symlink and pm2
#
# Usage: remote-deploy.sh [branch]   (defaults to master)
set -eu

BRANCH="${1:-master}"
REPO_URL="https://github.com/jamessmoore/webtechhq-site.git"
APP_DIR="/srv/webtechhq"
RELEASES_DIR="$APP_DIR/releases"
CURRENT="$APP_DIR/current"
KEEP_RELEASES=5

mkdir -p "$RELEASES_DIR"

# Deletes releases beyond the last $KEEP_RELEASES (by mtime), skipping
# whichever one "current" points to no matter where it falls in that
# ordering. Called both before and after the build: a release that fails
# partway through (clone succeeds, npm ci/build doesn't) still leaves a
# full node_modules on disk, and with only success-path cleanup those
# orphans never get removed — on this host's small root volume, a run of
# failed deploys silently filled the disk and broke even SSM's ability to
# run commands on the box, which is what surfaced this in the first place.
prune_old_releases() {
  local live=""
  if [ -L "$CURRENT" ]; then
    live=$(readlink -f "$CURRENT")
  fi
  cd "$RELEASES_DIR"
  ls -1dt */ 2>/dev/null | tail -n +$((KEEP_RELEASES + 1)) | while read -r d; do
    d="${d%/}"
    full="$RELEASES_DIR/$d"
    [ "$full" = "$live" ] && continue
    rm -rf "$full"
  done
}

echo "==> Pruning old releases before build (keeping last $KEEP_RELEASES, plus the live release)"
prune_old_releases

# One-time migration from the old layout, where the app was checked out
# directly into $APP_DIR instead of $APP_DIR/releases/<ts> + current symlink.
if [ ! -L "$CURRENT" ] && [ -d "$APP_DIR/.git" ]; then
  echo "==> Migrating existing deployment into releases/ layout"
  LEGACY="$RELEASES_DIR/legacy-$(date +%Y%m%d%H%M%S)"
  mkdir -p "$LEGACY"
  find "$APP_DIR" -maxdepth 1 -mindepth 1 ! -name releases -exec mv {} "$LEGACY"/ \;
  ln -sfn "$LEGACY" "$CURRENT"
fi

RELEASE="$RELEASES_DIR/$(date +%Y%m%d%H%M%S)"
echo "==> Cloning $BRANCH into $RELEASE"
git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$RELEASE"

echo "==> Carrying over .env.local"
if [ -f "$CURRENT/.env.local" ]; then
  cp "$CURRENT/.env.local" "$RELEASE/.env.local"
fi

cd "$RELEASE"

echo "==> Installing dependencies"
npm ci

echo "==> Building"
npm run build

PREVIOUS=""
if [ -L "$CURRENT" ]; then
  PREVIOUS=$(readlink -f "$CURRENT")
fi

echo "==> Switching current -> $RELEASE"
ln -sfn "$RELEASE" "$CURRENT"

echo "==> Restarting app"
pm2 delete webtechhq >/dev/null 2>&1 || true
pm2 start npm --name webtechhq --cwd "$CURRENT" -- start
pm2 save

echo "==> Health check: app"
HEALTHY=0
for _ in $(seq 1 15); do
  if curl -sf -o /dev/null http://127.0.0.1:3000/; then
    HEALTHY=1
    break
  fi
  sleep 2
done

# The app responding on :3000 doesn't mean the public site works — nginx
# serves /_next/static/ and /public/ directly via aliases into this release's
# directory tree, so also check that a static asset from the homepage is
# reachable through nginx (catches path/alias mismatches like the one that
# broke styling site-wide after the first release-based deploy).
if [ "$HEALTHY" -eq 1 ]; then
  echo "==> Health check: static assets via nginx"
  HEALTHY=0
  ASSET_PATH=$(curl -sf http://127.0.0.1:3000/ | grep -oE '/_next/static/[^"]+\.css' | head -n1)
  if [ -n "$ASSET_PATH" ] && curl -sfk -H "Host: webtechhq.com" "https://127.0.0.1$ASSET_PATH" -o /dev/null; then
    HEALTHY=1
  else
    echo "Static asset '$ASSET_PATH' not reachable via nginx"
  fi
fi

if [ "$HEALTHY" -ne 1 ]; then
  echo "Health check FAILED"
  if [ -n "$PREVIOUS" ] && [ -d "$PREVIOUS" ]; then
    echo "==> Rolling back current -> $PREVIOUS"
    ln -sfn "$PREVIOUS" "$CURRENT"
    pm2 delete webtechhq >/dev/null 2>&1 || true
    pm2 start npm --name webtechhq --cwd "$CURRENT" -- start
    pm2 save
  fi
  exit 1
fi

echo "==> Cleaning up old releases (keeping last $KEEP_RELEASES)"
prune_old_releases

echo "==> Deploy successful: $RELEASE"
