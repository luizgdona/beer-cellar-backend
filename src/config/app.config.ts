import { config } from 'dotenv';

config();

export const appConfig = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'beer_user',
    password: process.env.DB_PASSWORD ?? (() => { throw new Error('DB_PASSWORD env var is required'); })(),
    database: process.env.DB_NAME || 'beer_cellar_db',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? (() => { throw new Error('JWT_SECRET env var is required'); })(),
    refreshSecret: process.env.REFRESH_TOKEN_SECRET ?? (() => { throw new Error('REFRESH_TOKEN_SECRET env var is required'); })(),
    expiresIn: '15m',
    refreshExpiresIn: '7d',
  },

  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_S3_BUCKET || 'beer-cellar',
    region: process.env.AWS_REGION || 'us-east-1',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '2525'),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM || 'noreply@beercellar.com',
  },

  urls: {
    backend: process.env.BACKEND_URL || 'http://localhost:3001',
    frontend: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
};
