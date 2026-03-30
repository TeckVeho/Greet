// PM2 Ecosystem Configuration for production stage branch
// Runs side-by-side with main on the same server using separate ports/process names.

const fs = require('fs')
const path = require('path')

// deploy.sh writes the absolute Node 20+ path here so PM2 uses the correct
// interpreter even when its daemon was originally spawned under an older Node.
let nodeInterpreter = 'node'
try {
  nodeInterpreter = fs
    .readFileSync(path.join(__dirname, '.node-interpreter'), 'utf8')
    .trim()
} catch {}

module.exports = {
  apps: [
    {
      name: 'greet-stage-backend',
      interpreter: nodeInterpreter,
      exec_mode: 'fork',
      cwd: './backend',
      script: 'dist/index.js',
      node_args: '--experimental-wasm-gc',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        PORT: 4300,
      },
    },
    {
      name: 'greet-stage-frontend',
      interpreter: nodeInterpreter,
      exec_mode: 'fork',
      cwd: './frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3302',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
}
