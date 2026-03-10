#!/usr/bin/env bash
# ──────────────────────────────────────────────
# One-time EC2 server setup for Greet
# Run as: ssh -i <key.pem> <user>@<host> 'bash -s' < scripts/setup-server.sh
# ──────────────────────────────────────────────
set -euo pipefail

echo "=== Greet Server Setup ==="

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

# ── Nginx ──
if ! command -v nginx &>/dev/null; then
  echo "Installing Nginx..."
  sudo apt-get update -y && sudo apt-get install -y nginx
else
  echo "Nginx already installed: $(nginx -v 2>&1)"
fi

# ── Project directory ──
PROJECT_DIR="$HOME/Greet"
if [ ! -d "$PROJECT_DIR" ]; then
  echo "Cloning repository..."
  git clone https://github.com/TeckVeho/Greet.git "$PROJECT_DIR"
  cd "$PROJECT_DIR"
  git checkout development
else
  echo "Project directory exists, pulling latest..."
  cd "$PROJECT_DIR"
  git checkout development
  git pull origin development
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

# ── Configure Nginx ──
echo "Setting up Nginx..."
sudo cp "$PROJECT_DIR/nginx/greet.conf" /etc/nginx/sites-available/greet
sudo ln -sf /etc/nginx/sites-available/greet /etc/nginx/sites-enabled/greet
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
sudo systemctl enable nginx

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
