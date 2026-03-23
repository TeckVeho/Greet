// PM2 Ecosystem Configuration for production stage branch
// Runs side-by-side with main on the same server using separate ports/process names.

module.exports = {
  apps: [
    {
      name: 'greet-stage-backend',
      cwd: './backend',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        PORT: 4100,
      },
    },
    {
      name: 'greet-stage-frontend',
      cwd: './frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3302',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
}
