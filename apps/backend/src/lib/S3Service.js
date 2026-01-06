import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import crypto from 'crypto';
import { env } from '../config/config.js';

// ================= S3 CLIENT =================
const s3 = new S3Client({
  region: env.s3.region,
  credentials: {
    accessKeyId: env.s3.accessKey,
    secretAccessKey: env.s3.secretKey,
  },
});

// ================= CONSTANTS =================
const MAIN_FOLDER = 'fintech';

// 🔐 Allowed categories (SECURITY)
const ALLOWED_CATEGORIES = [
  'employee-profile',
  'user-profile',
  'kyc',
  'documents',
  'logos',
  'favicons',
];

// ================= SERVICE =================
class S3Service {
  constructor() {
    if (!env.s3.bucket) {
      throw new Error('S3 bucket not configured');
    }
    this.bucket = env.s3.bucket;
  }

  // ================= UPLOAD =================
  async upload(localFilePath, category) {
    if (!localFilePath) {
      throw new Error('File path is required');
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      throw new Error(`Invalid upload category: ${category}`);
    }

    const fileStream = fs.createReadStream(localFilePath);
    const ext = path.extname(localFilePath);
    const mimeType = mime.lookup(localFilePath) || 'application/octet-stream';

    const uniqueName = `${Date.now()}_${crypto.randomUUID()}${ext}`;
    const s3Key = `${MAIN_FOLDER}/${category}/${uniqueName}`;

    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: s3Key,
          Body: fileStream,
          ContentType: mimeType,
          ACL: 'private', // 🔐 fintech-safe
        }),
      );

      return {
        key: s3Key, // 🔥 store this in DB
        url: `https://${this.bucket}.s3.${env.s3.region}.amazonaws.com/${s3Key}`,
      };
    } finally {
      // cleanup local file (always)
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    }
  }

  // ================= DELETE =================
  async deleteByKey(s3Key) {
    if (!s3Key) {
      throw new Error('S3 key is required');
    }

    await s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
      }),
    );

    return true;
  }

  buildS3Url(key) {
    if (!key) return null;

    return `https://${env.s3.bucket}.s3.${env.s3.region}.amazonaws.com/${key}`;
  }

  // ================= HELPERS =================
  extractKeyFromUrl(fileUrl) {
    if (!fileUrl) return null;
    return fileUrl.split('.amazonaws.com/')[1] || null;
  }
}

// ================= EXPORT =================
export const s3Service = new S3Service();
export default s3Service;
