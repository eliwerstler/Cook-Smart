module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5001,
  DATABASE_PATH: process.env.DATABASE_PATH || './database/cooksmart.db'
};
