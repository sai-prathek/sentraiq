module.exports = {
  apps: [
    {
      name: 'sentraiq-frontend',
      script: 'npm',
      args: 'run dev',
      cwd: '/root/sai/SentraIQ-main/SentraIQ-main/frontend/sentraiq-dashboard',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 8081
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
}
