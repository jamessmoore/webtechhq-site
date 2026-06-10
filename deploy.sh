#!/bin/bash
# deploy.sh — manual deploy to EC2
# Usage: ./deploy.sh <elastic-ip>
# Example: ./deploy.sh 54.123.45.67

set -euo pipefail

SERVER="${1:?Usage: ./deploy.sh <server-ip>}"
SSH_USER="ubuntu"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"
APP_DIR="/srv/webtechhq"
BRANCH="${BRANCH:-main}"

echo "==> Deploying to $SERVER"

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "$SSH_USER@$SERVER" << REMOTE
set -euo pipefail
echo "--- Pulling latest code"
cd $APP_DIR
git pull origin $BRANCH

echo "--- Installing dependencies"
npm ci --omit=dev

echo "--- Building"
npm run build

echo "--- Restarting PM2"
pm2 restart webtechhq || pm2 start npm --name webtechhq -- start
pm2 save

echo "--- Done"
pm2 status
REMOTE

echo "==> Deploy complete."
