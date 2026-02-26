import AadhaarService from './aadhaar/aadhaar.service.js';
import { ApiError } from '../lib/ApiError.js';
import { kycDocumentTable, usersKycTable } from '../models/core/index.js';
import { panTransactionTable } from '../models/pancard/index.js';
import { db } from '../database/core/core-db.js';
import { aadhaarTransactionTable } from '../models/aadhaar/index.js';
import { desc, eq } from 'drizzle-orm';

class KycService {
  static async sendOtp(type, payload, actor) {
    switch (type.toLowerCase()) {
      case 'aadhaar':
        return AadhaarService.sendOtp({
          ...payload,
          actor,
        });

      default:
        throw ApiError.badRequest('Invalid KYC type');
    }
  }

  static async verify(type, payload, actor, files) {
    switch (type.toLowerCase()) {
      case 'aadhaar':
        return AadhaarService.verify({
          ...payload,
          actor,
          files,
        });

      default:
        throw ApiError.badRequest('Invalid KYC type');
    }
  }

  static async getStatus(actor) {
    const [result] = await db
      .select({
        usersKyc: usersKycTable,
        aadhaar: aadhaarTransactionTable,
        pan: panTransactionTable,
        document: kycDocumentTable,
      })
      .from(usersKycTable)
      .leftJoin(
        aadhaarTransactionTable,
        eq(usersKycTable.id, aadhaarTransactionTable.usersKycId),
      )
      .leftJoin(
        panTransactionTable,
        eq(usersKycTable.id, panTransactionTable.usersKycId),
      )
      .leftJoin(
        kycDocumentTable,
        eq(usersKycTable.userId, kycDocumentTable.ownerId),
      )
      .where(eq(usersKycTable.userId, actor.id))
      .orderBy(desc(usersKycTable.createdAt))
      .limit(1);

    if (!result) {
      return {
        status: 'NOT_STARTED',
      };
    }

    return {
      status: result.usersKyc.verificationStatus,
      aadhaarStatus: result.usersKyc.aadhaarStatus,
      panStatus: result.usersKyc.panStatus,
      kycMode: result.usersKyc.kycMode,
      documentsUploaded: !!result.document,
      createdAt: result.usersKyc.createdAt,
    };
  }
}

export default KycService;
