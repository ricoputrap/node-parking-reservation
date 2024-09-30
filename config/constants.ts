import dotenv from 'dotenv'
dotenv.config();

export const PORT = process.env.PORT || 3000;

export const CRYPTO_ALGO = process.env.CRYPTO_ALGO || 'aes-256-cbc';
export const CRYPTO_KEY = process.env.CRYPTO_KEY || '';
export const CRYPTO_IV = process.env.CRYPTO_IV || '';

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "";
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "";

export const ACCESS_TOKEN_EXPIRATION = '15m';
export const REFRESH_TOKEN_EXPIRATION = '1d';