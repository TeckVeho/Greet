#!/usr/bin/env bash
# ──────────────────────────────────────────────
# Deploy script – runs on EC2 after git pull
# Called by GitHub Actions or manually:
#   ssh deploy@server 'cd ~/Greet && bash scripts/deploy.sh'
# ──────────────────────────────────────────────
set -euo pipefail

PROJECT_DIR="$HOME/Greet"
DEPLOY_BRANCH="${1:-development}"
PM2_CONFIG="ecosystem.config.js"

if [ "$DEPLOY_BRANCH" = "main" ] && [ -f "$PROJECT_DIR/ecosystem.prod.config.js" ]; then
	PM2_CONFIG="ecosystem.prod.config.js"
fi

cd "$PROJECT_DIR"

if ! command -v node >/dev/null 2>&1; then
	echo "Node.js is not installed. Please install Node.js 20+ before deploy."
	exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 20 ]; then
	echo "Node.js $(node -v) detected. Prisma requires Node.js 20+."
	echo "Activate nvm Node 20 (e.g. 'nvm use 20') and retry."
	exit 1
fi

npm_ci_with_retry() {
	local dir="$1"
	local label="$2"

	cd "$dir"
	echo "Installing ${label} dependencies..."
	if npm ci --no-audit --no-fund; then
		return 0
	fi

	echo "First npm ci failed for ${label}. Cleaning cache and retrying once..."
	rm -rf node_modules
	npm cache clean --force
	npm cache verify
	npm ci --no-audit --no-fund --prefer-online --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
}

echo "=== Deploying Greet (${DEPLOY_BRANCH}) ==="

# ── Pull latest code ──
echo "[1/6] Pulling latest code..."
git fetch origin "$DEPLOY_BRANCH"
git reset --hard "origin/$DEPLOY_BRANCH"

# ── Backend ──
echo "[2/6] Installing backend dependencies..."
npm_ci_with_retry "$PROJECT_DIR/backend" "backend"

echo "[3/6] Building backend..."
npm run build

echo "[4/6] Running database migrations..."
npx prisma migrate deploy 2>/dev/null || echo "No pending migrations"

# ── Frontend ──
echo "[5/6] Installing frontend dependencies & building..."
npm_ci_with_retry "$PROJECT_DIR/frontend" "frontend"
npm run build

# ── Restart PM2 ──
echo "[6/6] Restarting PM2 processes..."
cd "$PROJECT_DIR"
pm2 restart "$PM2_CONFIG" 2>/dev/null || pm2 start "$PM2_CONFIG"
pm2 save

echo "=== Deploy Complete ==="
