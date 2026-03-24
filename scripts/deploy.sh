#!/usr/bin/env bash

set -euo pipefail
trap 'echo "Deploy failed at line $LINENO with exit code $?."' ERR

DEPLOY_BRANCH="${1:-development}"

case "$DEPLOY_BRANCH" in
	main)
		PROJECT_DIR="${PROJECT_DIR:-$HOME/Greet}"
		PM2_CONFIG="ecosystem.prod.config.js"
		;;
	stage)
		PROJECT_DIR="${PROJECT_DIR:-$HOME/Greet-stage}"
		PM2_CONFIG="ecosystem.stage.config.js"
		;;
	*)
		PROJECT_DIR="${PROJECT_DIR:-$HOME/Greet}"
		PM2_CONFIG="ecosystem.config.js"
		;;
esac

if [ ! -d "$PROJECT_DIR/.git" ]; then
	if [ -d "$PROJECT_DIR" ] && [ -n "$(ls -A "$PROJECT_DIR" 2>/dev/null)" ]; then
		echo "Project directory exists but is not a git checkout: $PROJECT_DIR"
		echo "Please clean this directory or point PROJECT_DIR to a valid checkout."
		exit 1
	fi

	echo "Project directory not found at $PROJECT_DIR. Cloning repository..."
	git clone https://github.com/TeckVeho/Greet.git "$PROJECT_DIR"
fi

cd "$PROJECT_DIR"

if [ ! -f "$PM2_CONFIG" ]; then
	echo "PM2 config not found: $PROJECT_DIR/$PM2_CONFIG"
	exit 1
fi

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
	if npm ci --no-audit --no-fund --progress=false; then
		return 0
	fi

	echo "First npm ci failed for ${label}. Cleaning cache and retrying once..."
	rm -rf node_modules
	npm cache clean --force
	npm cache verify
	npm ci --no-audit --no-fund --progress=false --prefer-online --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
}

run_npm_script() {
	local dir="$1"
	local script="$2"
	(
		cd "$dir"
		npm run "$script"
	)
}

run_prisma_migrate_deploy() {
	local dir="$1"
	(
		cd "$dir"
		npx prisma migrate deploy
	)
}

install_if_lock_changed() {
	local dir="$1"
	local label="$2"
	local required_bin="${3:-}"
	local lock_file="$dir/package-lock.json"
	local hash_file="$dir/.package-lock.sha256"

	if [ ! -f "$lock_file" ]; then
		echo "Missing lock file for ${label}: $lock_file"
		exit 1
	fi

	local current_hash
	current_hash="$(sha256sum "$lock_file" | awk '{print $1}')"
	local previous_hash=""
	if [ -f "$hash_file" ]; then
		previous_hash="$(cat "$hash_file" 2>/dev/null || true)"
	fi

	if [ -d "$dir/node_modules" ] && [ "$current_hash" = "$previous_hash" ]; then
		if [ -n "$required_bin" ] && [ ! -x "$dir/$required_bin" ]; then
			echo "Lockfile unchanged for ${label}, but required binary is missing: $dir/$required_bin"
			echo "Reinstalling ${label} dependencies..."
		else
		echo "Lockfile unchanged for ${label}; skipping npm ci."
		return 0
		fi
	fi

	npm_ci_with_retry "$dir" "$label"
	printf '%s\n' "$current_hash" > "$hash_file"
}

echo "=== Deploying Greet (${DEPLOY_BRANCH}) ==="
echo "Project directory: ${PROJECT_DIR}"
echo "PM2 config: ${PM2_CONFIG}"
echo "Node version: $(node -v)"
echo "npm version: $(npm -v)"
echo "Memory snapshot:"
free -h || true
echo "Disk snapshot:"
df -h || true

# ── Pull latest code ──
echo "[1/6] Pulling latest code..."
git fetch origin "$DEPLOY_BRANCH"
git reset --hard "origin/$DEPLOY_BRANCH"

# ── Backend ──
echo "[2/6] Installing backend dependencies..."
install_if_lock_changed "$PROJECT_DIR/backend" "backend" "node_modules/.bin/prisma"

echo "[3/6] Building backend..."
export NODE_OPTIONS="${NODE_OPTIONS:+$NODE_OPTIONS }--experimental-wasm-gc"
run_npm_script "$PROJECT_DIR/backend" "build"

echo "[4/6] Running database migrations..."
run_prisma_migrate_deploy "$PROJECT_DIR/backend" 2>/dev/null || echo "No pending migrations"

# ── Frontend ──
echo "[5/6] Installing frontend dependencies & building..."
install_if_lock_changed "$PROJECT_DIR/frontend" "frontend" "node_modules/.bin/next"
export NEXT_TELEMETRY_DISABLED=1
export NODE_OPTIONS="--max-old-space-size=2048"
# Avoid stale Next artifacts causing server-action ID mismatches across deploys.
rm -rf "$PROJECT_DIR/frontend/.next"
run_npm_script "$PROJECT_DIR/frontend" "build"

if [ ! -x "$PROJECT_DIR/frontend/node_modules/.bin/next" ]; then
	echo "Frontend runtime binary not found after install/build: $PROJECT_DIR/frontend/node_modules/.bin/next"
	exit 1
fi

# ── Restart PM2 ──
echo "[6/6] Restarting PM2 processes..."
cd "$PROJECT_DIR"
pm2 restart "$PM2_CONFIG" 2>/dev/null || pm2 start "$PM2_CONFIG"
pm2 save

echo "=== Deploy Complete ==="
