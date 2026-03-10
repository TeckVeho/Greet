// PM2 Ecosystem Configuration
// Usage: pm2 start ecosystem.config.js
// Env vars are loaded from each app's .env file.

module.exports = {
  apps: [
    {
      name: 'greet-backend',
      cwd: './backend',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
    },
    {
      name: 'greet-frontend',
      cwd: './frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
}
