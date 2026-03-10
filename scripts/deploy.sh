#!/usr/bin/env bash
# ──────────────────────────────────────────────
# Deploy script – runs on EC2 after git pull
# Called by GitHub Actions or manually:
#   ssh deploy@server 'cd ~/Greet && bash scripts/deploy.sh'
# ──────────────────────────────────────────────
set -euo pipefail

PROJECT_DIR="$HOME/Greet"
cd "$PROJECT_DIR"

echo "=== Deploying Greet ==="

# ── Pull latest code ──
echo "[1/7] Pulling latest code..."
git fetch origin development
git reset --hard origin/development

# ── Backend ──
echo "[2/7] Installing backend dependencies..."
cd "$PROJECT_DIR/backend"
npm ci

echo "[3/7] Building backend..."
npm run build

echo "[4/7] Running database migrations..."
npx prisma migrate deploy 2>/dev/null || echo "No pending migrations"

# ── Frontend ──
echo "[5/7] Installing frontend dependencies & building..."
cd "$PROJECT_DIR/frontend"
npm ci
npm run build

# ── Restart PM2 ──
echo "[6/7] Restarting PM2 processes..."
cd "$PROJECT_DIR"
pm2 restart ecosystem.config.js 2>/dev/null || pm2 start ecosystem.config.js
pm2 save

# ── Update Nginx config (if changed) ──
echo "[7/7] Updating Nginx config..."
sudo cp "$PROJECT_DIR/nginx/greet.conf" /etc/nginx/sites-available/greet
sudo nginx -t && sudo systemctl reload nginx

echo "=== Deploy Complete ==="
