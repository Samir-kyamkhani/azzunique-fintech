import RechargeRuntimeService from '../../services/recharge/rechargeRuntime.service.js';
import OperatorMapService from '../../services/recharge-admin/operatorMap.service.js';
import { RECHARGE_SERVICE_CODE } from '../../config/constant.js';
import { buildTenantChain } from '../../lib/tenantHierarchy.util.js';

export const fetchOperatorsByFeature = async (req, res, next) => {
  try {
    const { feature } = req.params;

    const tenantChain = await buildTenantChain(req.user.tenantId);

    // Resolve service + feature + provider
    const {
      service,
      feature: resolvedFeature,
      provider,
    } = await RechargeRuntimeService.resolve({
      tenantChain,
      platformServiceCode: RECHARGE_SERVICE_CODE,
      featureCode: feature,
    });

    // Fetch operators for this specific feature
    const operators = await OperatorMapService.listForRecharge({
      platformServiceId: service.id,
      platformServiceFeatureId: resolvedFeature.id, // ✅ IMPORTANT
      serviceProviderId: provider.providerId,
    });

    res.json({
      success: true,
      data: operators,
    });
  } catch (err) {
    next(err);
  }
};
