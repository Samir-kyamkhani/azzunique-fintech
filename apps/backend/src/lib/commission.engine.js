import { db } from '../database/core/core-db.js';
import {
  userCommissionSettingTable,
  roleCommissionSettingTable,
  commissionEarningTable,
  walletTable,
} from '../models/core/index.js';
import { eq, and } from 'drizzle-orm';
import WalletService from '../services/wallet.service.js';
import crypto from 'crypto';

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
      // 1️⃣ Resolve commission rule
      const [userRule] = await db
        .select()
        .from(userCommissionSettingTable)
        .where(
          and(
            eq(userCommissionSettingTable.userId, user.id),
            eq(
              userCommissionSettingTable.platformServiceFeatureId,
              platformServiceFeatureId,
            ),
            eq(userCommissionSettingTable.isActive, true),
          ),
        )
        .limit(1);

      let rule = userRule;

      if (!rule) {
        const [roleRule] = await db
          .select()
          .from(roleCommissionSettingTable)
          .where(
            and(
              eq(roleCommissionSettingTable.roleId, user.roleId),
              eq(
                roleCommissionSettingTable.platformServiceFeatureId,
                platformServiceFeatureId,
              ),
              eq(roleCommissionSettingTable.isActive, true),
            ),
          )
          .limit(1);

        rule = roleRule;
      }

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
        amount: netAmount,
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
        netAmount,

        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }
}

export default CommissionEngine;
