module.exports = {
  apps : [{
    name: 'SourceMap Scout',
    script: 'ts-node',
    args: 'src/main.ts',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
