import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128-bit
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

const safeEqual = (a, b) => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) return false;

  return crypto.timingSafeEqual(bufA, bufB);
};

export const encrypt = (plainText) => {
  if (!plainText) return plainText;

  try {
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plainText, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    /**
     * Format:
     * iv:encrypted:authTag (hex)
     */
    return [
      iv.toString('hex'),
      encrypted.toString('hex'),
      authTag.toString('hex'),
    ].join(':');
  } catch (err) {
    console.error('Encryption error:', err);
    throw new Error('Encryption failed');
  }
};

export const decrypt = (cipherText) => {
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

export const verifyPassword = (plainText, encryptedText) => {
  if (!plainText || !encryptedText) return false;

  try {
    const decrypted = decrypt(encryptedText);
    console.log(decrypted);

    return safeEqual(plainText, decrypted);
  } catch {
    return false;
  }
};

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TTL,
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_TTL,
  });
};

export const generateTokens = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
  };
};

export const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

export function generateNumber(prefix, length = 6) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  return `${prefix}-${Math.floor(min + Math.random() * (max - min + 1))}`;
}

export const generatePassword = (length = 12) => {
  if (length < 4) {
    throw new Error('Password length must be at least 4 characters.');
  }

  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';

  let password = '';

  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));

  for (let i = 4; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  const passwordArray = password.split('');
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  const shuffledPassword = passwordArray.join('');

  return shuffledPassword;
};

export const generateTransactionPin = (length = 4) => {
  if (length < 1) {
    throw new Error('PIN length must be at least 1 digit.');
  }

  const numbers = '0123456789';
  let pin = '';

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
      pin += numbers.charAt(randomValues[i] % numbers.length);
    }
  } else {
    for (let i = 0; i < length; i++) {
      pin += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
  }

  return pin;
};

export function generatePrefix(source, length = 3, padChar = 'X') {
  if (!source || typeof source !== 'string') {
    throw new Error('generatePrefix requires a non-empty string');
  }

  const cleaned = source.replace(/[^A-Za-z]/g, '').toUpperCase();

  if (!cleaned.length) {
    throw new Error('generatePrefix: invalid source after sanitization');
  }

  return cleaned.length >= length
    ? cleaned.substring(0, length)
    : cleaned.padEnd(length, padChar);
}
