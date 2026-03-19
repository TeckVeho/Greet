// PM2 Ecosystem Configuration for production main branch
// Uses a non-conflicting frontend port for shared multi-project servers.

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
      args: 'start -p 3202',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
}
