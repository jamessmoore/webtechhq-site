#!/bin/bash
# deploy.sh — manual deploy to EC2
# Usage: ./deploy.sh <elastic-ip> [branch]
# Example: ./deploy.sh 54.123.45.67

set -euo pipefail

SERVER="${1:?Usage: ./deploy.sh <server-ip> [branch]}"
BRANCH="${2:-master}"
SSH_USER="ubuntu"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"

echo "==> Deploying $BRANCH to $SERVER"

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "$SSH_USER@$SERVER" \
  "bash -s -- $BRANCH" < deploy/remote-deploy.sh

echo "==> Deploy complete."
