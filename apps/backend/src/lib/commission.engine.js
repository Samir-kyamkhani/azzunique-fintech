import { db } from '../database/core/core-db.js';
import { commissionEarningTable } from '../models/core/index.js';
import crypto from 'crypto';
import WalletService from '../services/wallet.service.js';
import CommissionSettingService from '../services/commission-setting.service.js';

class CommissionEngine {
  /* ================= RULE ================= */
  static async resolveRule({ transaction, user }) {
    return CommissionSettingService.resolveForUser({
      tenantId: transaction.tenantId,
      userId: user.id,
      roleId: user.roleId,
      platformServiceId: transaction.platformServiceId,
      platformServiceFeatureId: transaction.platformServiceFeatureId,
      amount: transaction.amount,
    });
  }

  /* ================= COMMISSION ================= */
  static calculateCommission(rule, amount) {
    if (rule.mode !== 'COMMISSION') return 0;

    if (rule.type === 'FLAT') return rule.value;

    return Math.floor((amount * rule.value) / 100);
  }

  /* ================= SURCHARGE ================= */
  static calculateSurcharge(rule, amount) {
    if (rule.mode !== 'SURCHARGE') return 0;

    if (rule.type === 'FLAT') return rule.value;

    return Math.floor((amount * rule.value) / 100);
  }

  /* ================= TAX ================= */
  static calculateTaxes(rule, { commissionAmount, surchargeAmount }) {
    let gstAmount = 0;
    let tdsAmount = 0;

    if (rule.applyGST && surchargeAmount > 0) {
      gstAmount = Math.floor((surchargeAmount * rule.gstPercent) / 100);
    }

    if (rule.applyTDS && commissionAmount > 0) {
      tdsAmount = Math.floor((commissionAmount * rule.tdsPercent) / 100);
    }

    return { gstAmount, tdsAmount };
  }

  /* ================= WALLET FETCH ================= */
  static async getUserWallet(user) {
    const wallets = await WalletService.getUserWallets(user.id, user.tenantId);

    return wallets.find((w) => w.walletType === 'COMMISSION');
  }

  /* ================= CREDIT COMMISSION ================= */
  static async creditCommission({ wallet, user, transaction, amounts, rule }) {
    const {
      commissionAmount,
      surchargeAmount,
      gstAmount,
      tdsAmount,
      finalAmount,
    } = amounts;

    const baseAmount =
      rule.mode === 'COMMISSION' ? commissionAmount : surchargeAmount;

    try {
      await db.insert(commissionEarningTable).values({
        id: crypto.randomUUID(),

        userId: user.id,
        tenantId: transaction.tenantId,
        walletId: wallet.id,
        transactionId: transaction.id,

        platformServiceId: transaction.platformServiceId,
        platformServiceFeatureId: transaction.platformServiceFeatureId,

        mode: rule.mode,
        type: rule.type,
        value: rule.value,

        baseAmount,
        gstAmount,
        tdsAmount,
        finalAmount,

        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (err) {
      if (err?.code === 'ER_DUP_ENTRY') {
        return;
      }

      throw err;
    }

    await WalletService.creditWallet({
      walletId: wallet.id,
      amount: finalAmount,
      transactionId: transaction.id,
      reference: `COMMISSION:${transaction.id}:${user.id}`,
    });
  }

  /* ================= MAIN PROCESS ================= */
  static async process({ transaction, user }) {
    const rule = await this.resolveRule({ transaction, user });

    if (!rule) return;

    const amount = transaction.amount;

    /* ================= CALCULATION ================= */

    const commissionAmount = this.calculateCommission(rule, amount);

    const surchargeAmount = this.calculateSurcharge(rule, amount);

    let grossAmount = commissionAmount - surchargeAmount;

    if (grossAmount < 0) grossAmount = 0;

    const { gstAmount, tdsAmount } = this.calculateTaxes(rule, {
      commissionAmount,
      surchargeAmount,
    });

    const finalAmount = grossAmount - gstAmount - tdsAmount;

    if (finalAmount <= 0) return;

    /* ================= WALLET ================= */

    const wallet = await this.getUserWallet(user);

    if (!wallet) return;

    /* ================= CREDIT ================= */

    await this.creditCommission({
      wallet,
      user,
      transaction,
      rule,
      amounts: {
        commissionAmount,
        surchargeAmount,
        gstAmount,
        tdsAmount,
        finalAmount,
      },
    });
  }
}

export default CommissionEngine;
