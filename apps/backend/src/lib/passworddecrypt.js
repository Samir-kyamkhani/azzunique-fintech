import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256-bit
const SECRET_KEY_HEX = process.env.ENCRYPT_SECRET_KEY;

/* ---------------- INTERNAL HELPERS ---------------- */

const getKey = () => {
  if (!SECRET_KEY_HEX) {
    throw new Error('ENCRYPT_SECRET_KEY is missing');
  }

  const key = Buffer.from(SECRET_KEY_HEX, 'hex');

  if (key.length !== KEY_LENGTH) {
    throw new Error(
      'Invalid ENCRYPT_SECRET_KEY length. Must be 32 bytes (64 hex chars).',
    );
  }

  return key;
};

const decrypt = (cipherText) => {
  if (!cipherText) return cipherText;

  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted payload format');
    }

    const [ivHex, encryptedHex, authTagHex] = parts;

    const key = getKey();
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (err) {
    console.error('Decryption error:', err);
    throw new Error('Decryption failed');
  }
};

console.log(
  decrypt(
    '3e780645fa65ca1cde12719bdb27b2ed:2e6316872210b4c631f63411:52a5e2f8f3a49b0f9c240cb90a7432d2',
  ),
);
