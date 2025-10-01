module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production',
  DATABASE_PATH: process.env.DATABASE_PATH || './database/cooksmart.db'
};
