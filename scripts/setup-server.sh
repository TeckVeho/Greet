#!/usr/bin/env bash
# ──────────────────────────────────────────────
# One-time EC2 server setup for Greet
# Run as: ssh -i <key.pem> <user>@<host> 'bash -s' < scripts/setup-server.sh
# ──────────────────────────────────────────────
set -euo pipefail

DEPLOY_BRANCH="${1:-development}"
APACHE_CONF_SOURCE="${2:-apache/greet.conf}"

echo "=== Greet Server Setup ==="
echo "Branch: ${DEPLOY_BRANCH}"
echo "Apache config: ${APACHE_CONF_SOURCE}"

# ── Node.js (via nvm) ──
if ! command -v node &>/dev/null; then
  echo "Installing nvm + Node.js 20 LTS..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  # shellcheck source=/dev/null
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  nvm install 20
  nvm alias default 20
else
  echo "Node.js already installed: $(node -v)"
fi

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

# ── Install dependencies ──
echo "Installing backend dependencies..."
cd "$PROJECT_DIR/backend"
npm ci

echo "Installing frontend dependencies..."
cd "$PROJECT_DIR/frontend"
npm ci

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
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "=== Setup Complete ==="
echo "App: http://$(hostname -I | awk '{print $1}')"
echo ""
echo "Useful commands:"
echo "  pm2 status          – check process status"
echo "  pm2 logs            – view logs"
echo "  pm2 restart all     – restart all processes"
