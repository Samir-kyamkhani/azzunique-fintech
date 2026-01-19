import { db } from '../database/core/core-db.js';
import { commissionEarningTable, walletTable } from '../models/core/index.js';
import { eq, and } from 'drizzle-orm';
import WalletService from '../services/wallet.service.js';
import crypto from 'crypto';
import CommissionSettingService from '../services/commission-setting.service.js';

class CommissionEngine {
  static async calculateAndCredit({ transaction, user }) {
    const {
      id: transactionId,
      tenantId,
      platformServiceId,
      platformServiceFeatureId,
      amount, // paise
    } = transaction;

    await db.transaction(async () => {
      // ✅ RULE RESOLUTION (SINGLE SOURCE OF TRUTH)
      const rule = await CommissionSettingService.resolveForUser({
        tenantId,
        userId: user.id,
        roleId: user.roleId,
        platformServiceFeatureId,
      });

      if (!rule) return;

      // 2️⃣ Commission calculation (PERCENTAGE OUT OF 100)
      const commissionAmount =
        rule.commissionType === 'FLAT'
          ? rule.commissionValue
          : Math.floor((amount * rule.commissionValue) / 100);

      const surchargeAmount =
        rule.surchargeType === 'FLAT'
          ? rule.surchargeValue
          : Math.floor((amount * rule.surchargeValue) / 100);

      let grossAmount = commissionAmount - surchargeAmount;
      if (grossAmount < 0) grossAmount = 0;

      // 3️⃣ GST
      let gstAmount = 0;
      if (rule.gstApplicable) {
        const gstBase =
          rule.gstOn === 'COMMISSION'
            ? commissionAmount
            : rule.gstOn === 'SURCHARGE'
              ? surchargeAmount
              : commissionAmount + surchargeAmount;

        gstAmount = Math.floor((gstBase * rule.gstRate) / 100);
      }

      const netAmount = grossAmount - gstAmount;
      if (netAmount <= 0) return;

      // ✅ APPLY MAX COMMISSION CAP (CRITICAL FIX)
      let finalAmount = netAmount;

      if (
        rule.maxCommissionValue &&
        rule.maxCommissionValue > 0 &&
        finalAmount > rule.maxCommissionValue
      ) {
        finalAmount = rule.maxCommissionValue;
      }

      // 4️⃣ Commission wallet (tenant-safe)
      const [commissionWallet] = await db
        .select()
        .from(walletTable)
        .where(
          and(
            eq(walletTable.ownerId, user.id),
            eq(walletTable.ownerType, 'USER'),
            eq(walletTable.walletType, 'COMMISSION'),
            eq(walletTable.tenantId, tenantId),
          ),
        )
        .limit(1);

      if (!commissionWallet) return;

      // 5️⃣ Credit wallet
      await WalletService.creditWallet({
        walletId: commissionWallet.id,
        amount: finalAmount,
        transactionId,
      });

      // 6️⃣ Persist earning
      await db.insert(commissionEarningTable).values({
        id: crypto.randomUUID(),
        userId: user.id,
        tenantId,
        walletId: commissionWallet.id,
        transactionId,
        platformServiceId,
        platformServiceFeatureId,

        commissionType: rule.commissionType,
        commissionValue: rule.commissionValue,
        commissionAmount,

        surchargeType: rule.surchargeType,
        surchargeValue: rule.surchargeValue,
        surchargeAmount,

        grossAmount,
        gstAmount,
        netAmount, // calculated net
        finalAmount, // actually credited (after cap)

        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }
}

export default CommissionEngine;
