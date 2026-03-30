// PM2 Ecosystem Configuration
// Usage: pm2 start ecosystem.config.js
// Env vars are loaded from each app's .env file.

const fs = require('fs')
const path = require('path')

let nodeInterpreter = 'node'
try {
  nodeInterpreter = fs
    .readFileSync(path.join(__dirname, '.node-interpreter'), 'utf8')
    .trim()
} catch {}

module.exports = {
  apps: [
    {
      name: 'greet-backend',
      interpreter: nodeInterpreter,
      exec_mode: 'fork',
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
      interpreter: nodeInterpreter,
      exec_mode: 'fork',
      cwd: './frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3002',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
}
