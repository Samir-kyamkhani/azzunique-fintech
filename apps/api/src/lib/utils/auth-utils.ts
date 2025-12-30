import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  createHmac,
} from 'node:crypto';
import type { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthUtilsService {
  private readonly logger = new Logger(AuthUtilsService.name);

  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly IV_LENGTH = 16; // 128 bits
  private readonly KEY_LENGTH = 32; // 256 bits
  private readonly secretKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    const key = this.configService.get<string>('security.encryptSecretKey');

    if (!key) {
      throw new Error('Environment variable ENCRYPT_SECRET_KEY is not set');
    }

    const keyBuffer = Buffer.from(key, 'hex');
    if (keyBuffer.length !== this.KEY_LENGTH) {
      throw new Error(
        `AUTH_SECRET_KEY must be ${this.KEY_LENGTH} bytes in hex`,
      );
    }

    this.secretKey = keyBuffer;
  }

  // Encrypt value (store in DB)
  encrypt(value: string): string {
    try {
      const iv = randomBytes(this.IV_LENGTH);
      const cipher = createCipheriv(this.ALGORITHM, this.secretKey, iv);

      let encrypted = cipher.update(value, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();
      return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
    } catch (error) {
      this.logger.error('Encryption failed:', error);
      throw new InternalServerErrorException('Encryption failed');
    }
  }

  // Decrypt value (show in dashboard)
  decrypt(encrypted: string): string {
    try {
      const [ivHex, encryptedHex, authTagHex] = encrypted.split(':');
      if (!ivHex || !encryptedHex || !authTagHex)
        throw new InternalServerErrorException('Invalid encrypted format');

      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = createDecipheriv(this.ALGORITHM, this.secretKey, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.error('Decryption failed:', error);
      throw new InternalServerErrorException('Decryption failed');
    }
  }

  verifyPassword(plain: string, encrypted: string): boolean {
    const decrypted = this.decrypt(encrypted);
    return plain === decrypted;
  }

  generateRandomPassword(length = 12): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    const rnd = randomBytes(length);

    for (let i = 0; i < length; i++) {
      result += chars[rnd[i] % chars.length];
    }
    return result;
  }

  // Transaction PIN ke liye methods
  generateRandomTransactionPin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  hashResetToken(token: string) {
    const secret = this.configService.get<string>('security.encryptSecretKey');

    if (!secret) {
      throw new Error('security.encryptSecretKey is not set in configuration');
    }

    return createHmac('sha256', secret).update(token).digest('hex');
  }

  stripSensitive<T extends object>(obj: T, fields: string[]): T {
    const clone: any = { ...obj };
    for (const f of fields) delete clone[f];
    return clone;
  }

  getClientIp(req: Request): string | null {
    const forwarded = req.headers['x-forwarded-for'];

    let ip: string | null = null;

    if (typeof forwarded === 'string') {
      ip = forwarded.split(',')[0]?.trim() || null;
    } else if (Array.isArray(forwarded)) {
      ip = forwarded[0]?.trim() || null;
    } else {
      ip = req.ip ?? req.socket?.remoteAddress ?? null;
    }

    if (!ip) return null;

    // Normalize IPv6-mapped IPv4 → "::ffff:127.0.0.1"
    if (ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');

    // Normalize IPv6 localhost
    if (ip === '::1') ip = '127.0.0.1';

    return ip;
  }

  getClientOrigin(req: Request): string | null {
    return req.get('origin') || req.get('Origin') || null;
  }

  getClientUserAgent(req: Request): string | null {
    return (req.headers['user-agent'] as string) || null;
  }
}
