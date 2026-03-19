#!/usr/bin/env bash
# ──────────────────────────────────────────────
# One-time EC2 server setup for Greet
# Run as: ssh -i <key.pem> <user>@<host> 'bash -s' < scripts/setup-server.sh
# ──────────────────────────────────────────────
set -euo pipefail

DEPLOY_BRANCH="${1:-development}"
APACHE_CONF_SOURCE="${2:-apache/greet.conf}"
PM2_CONFIG="ecosystem.config.js"

if [ "$DEPLOY_BRANCH" = "main" ] && [ -f "$HOME/Greet/ecosystem.prod.config.js" ]; then
  PM2_CONFIG="ecosystem.prod.config.js"
fi

echo "=== Greet Server Setup ==="
echo "Branch: ${DEPLOY_BRANCH}"
echo "Apache config: ${APACHE_CONF_SOURCE}"

# ── Node.js (via nvm) ──
echo "Ensuring nvm + Node.js 20 LTS..."
export NVM_DIR="$HOME/.nvm"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install 20
nvm alias default 20
nvm use 20
echo "Using Node.js: $(node -v)"

# ── PM2 ──
if ! command -v pm2 &>/dev/null; then
  echo "Installing PM2..."
  npm install -g pm2
  pm2 startup systemd -u deploy --hp /home/deploy 2>/dev/null || true
else
  echo "PM2 already installed: $(pm2 -v)"
fi

# ── Project directory ──
PROJECT_DIR="$HOME/Greet"
if [ ! -d "$PROJECT_DIR" ]; then
  echo "Cloning repository..."
  git clone https://github.com/TeckVeho/Greet.git "$PROJECT_DIR"
  cd "$PROJECT_DIR"
  git checkout "$DEPLOY_BRANCH"
else
  echo "Project directory exists, pulling latest..."
  cd "$PROJECT_DIR"
  git checkout "$DEPLOY_BRANCH"
  git pull origin "$DEPLOY_BRANCH"
fi

# Validate expected monorepo structure before continuing.
if [ ! -d "$PROJECT_DIR/backend" ] || [ ! -d "$PROJECT_DIR/frontend" ]; then
  echo "Expected directories not found in $PROJECT_DIR for branch '$DEPLOY_BRANCH'."
  echo "Make sure origin/$DEPLOY_BRANCH contains the monorepo (backend/ and frontend/), then retry."
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

# ── Install dependencies ──
npm_ci_with_retry "$PROJECT_DIR/backend" "backend"
npm_ci_with_retry "$PROJECT_DIR/frontend" "frontend"

# ── Build ──
echo "Building backend..."
cd "$PROJECT_DIR/backend"
npm run build

echo "Building frontend..."
cd "$PROJECT_DIR/frontend"
npm run build

# ── Prisma migrate ──
echo "Running database migrations..."
cd "$PROJECT_DIR/backend"
npx prisma migrate deploy

# ── Configure Apache ──
echo "Setting up Apache..."
if [ ! -f "$PROJECT_DIR/$APACHE_CONF_SOURCE" ]; then
  echo "Apache config not found: $PROJECT_DIR/$APACHE_CONF_SOURCE"
  exit 1
fi

if sudo -n true 2>/dev/null; then
  sudo cp "$PROJECT_DIR/$APACHE_CONF_SOURCE" /etc/httpd/conf.d/greet.conf
  sudo systemctl reload httpd
else
  echo "Skipping Apache copy/reload (sudo password required)."
  echo "Run manually:"
  echo "  sudo cp $PROJECT_DIR/$APACHE_CONF_SOURCE /etc/httpd/conf.d/greet.conf"
  echo "  sudo systemctl reload httpd"
fi

# ── Start PM2 ──
echo "Starting PM2 processes..."
cd "$PROJECT_DIR"
pm2 start "$PM2_CONFIG"
pm2 save

echo ""
echo "=== Setup Complete ==="
echo "App: http://$(hostname -I | awk '{print $1}')"
echo ""
echo "Useful commands:"
echo "  pm2 status          – check process status"
echo "  pm2 logs            – view logs"
echo "  pm2 restart all     – restart all processes"
