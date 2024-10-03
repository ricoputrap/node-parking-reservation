import * as crypto from 'crypto';
import { CRYPTO_ALGO, CRYPTO_IV, CRYPTO_KEY } from '../../../config/constants';

// createCipheriv & createDecipheriv()
const algo = CRYPTO_ALGO;
const key = Buffer.from(CRYPTO_KEY, 'hex');
const iv = Buffer.from(CRYPTO_IV, 'hex');

export const encrypt = (password: string) => {
  const cipher = crypto.createCipheriv(algo, key, iv);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return encrypted;
};

export const decrypt = (encrypted: string) => {
  const decipher = crypto.createDecipheriv(algo, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}