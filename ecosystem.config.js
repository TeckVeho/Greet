// PM2 Ecosystem Configuration
// Usage: pm2 start ecosystem.config.js
// Env vars are loaded from each app's .env file.

module.exports = {
  apps: [
    {
      name: 'greet-backend',
      cwd: './backend',
      script: 'dist/index.js',
      node_args: '--experimental-wasm-gc',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
    },
    {
      name: 'greet-frontend',
      cwd: './frontend',
      // PM2 runs a real JS file reliably; the .bin/next shim can be mis-resolved after resurrect.
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3002',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
}
