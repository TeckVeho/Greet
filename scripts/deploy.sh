#!/usr/bin/env bash
# ──────────────────────────────────────────────
# Deploy script – runs on EC2 after git pull
# Called by GitHub Actions or manually:
#   ssh deploy@server 'cd ~/Greet && bash scripts/deploy.sh'
# ──────────────────────────────────────────────
set -euo pipefail

PROJECT_DIR="$HOME/Greet"
DEPLOY_BRANCH="${1:-development}"

cd "$PROJECT_DIR"

echo "=== Deploying Greet (${DEPLOY_BRANCH}) ==="

# ── Pull latest code ──
echo "[1/6] Pulling latest code..."
git fetch origin "$DEPLOY_BRANCH"
git reset --hard "origin/$DEPLOY_BRANCH"

# ── Backend ──
echo "[2/6] Installing backend dependencies..."
cd "$PROJECT_DIR/backend"
npm ci --no-audit --no-fund

echo "[3/6] Building backend..."
npm run build

echo "[4/6] Running database migrations..."
npx prisma migrate deploy 2>/dev/null || echo "No pending migrations"

# ── Frontend ──
echo "[5/6] Installing frontend dependencies & building..."
cd "$PROJECT_DIR/frontend"
npm ci --no-audit --no-fund
npm run build

# ── Restart PM2 ──
echo "[6/6] Restarting PM2 processes..."
cd "$PROJECT_DIR"
pm2 restart ecosystem.config.js 2>/dev/null || pm2 start ecosystem.config.js
pm2 save

echo "=== Deploy Complete ==="
