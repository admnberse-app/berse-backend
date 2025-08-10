module.exports = {
  apps: [{
    name: 'bersemuka-backend',
    script: './dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    merge_logs: true,
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    autorestart: true,
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads'],
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 3000,
    // Health check
    health_check: {
      interval: 30,
      url: 'http://localhost:3001/health',
      max_consecutive_failures: 3
    },
    // Auto restart on memory threshold
    monitoring: true,
    // Environment specific
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 3001
    }
  }]
};