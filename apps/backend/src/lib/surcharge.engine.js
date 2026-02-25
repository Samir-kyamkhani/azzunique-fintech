import CommissionSettingService from '../services/commission-setting.service.js';

class SurchargeEngine {
  static async calculate({ transaction, user }) {
    const { tenantId, platformServiceId, platformServiceFeatureId, amount } =
      transaction;

    // 🔹 Resolve rule
    const rule = await CommissionSettingService.resolveForUser({
      tenantId,
      userId: user.id,
      roleId: user.roleId,
      platformServiceId,
      platformServiceFeatureId,
    });

    if (!rule) {
      return {
        surchargeAmount: 0,
        gstAmount: 0,
        finalAmount: 0,
      };
    }

    // 🔹 Surcharge calculate
    const surchargeAmount =
      rule.surchargeType === 'FLAT'
        ? rule.surchargeValue
        : Math.floor((amount * rule.surchargeValue) / 100);

    if (surchargeAmount <= 0) {
      return {
        surchargeAmount: 0,
        gstAmount: 0,
        finalAmount: 0,
      };
    }

    // 🔹 GST calculate
    let gstAmount = 0;

    if (rule.gstApplicable) {
      const gstBase =
        rule.gstOn === 'SURCHARGE'
          ? surchargeAmount
          : rule.gstOn === 'COMMISSION'
            ? 0
            : surchargeAmount;

      gstAmount = Math.floor((gstBase * rule.gstRate) / 100);
    }

    let finalAmount = surchargeAmount + gstAmount;

    // 🔹 Max cap
    if (rule.maxSurchargeValue > 0 && finalAmount > rule.maxSurchargeValue) {
      finalAmount = rule.maxSurchargeValue;
    }

    return {
      surchargeAmount,
      gstAmount,
      finalAmount,
    };
  }
}

export default SurchargeEngine;
