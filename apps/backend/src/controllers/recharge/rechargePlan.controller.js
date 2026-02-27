import RechargeRuntimeService from '../../services/recharge/rechargeRuntime.service.js';
import { getRechargePlugin } from '../../plugin_registry/recharge/pluginRegistry.js';
import { buildTenantChain } from '../../lib/tenantHierarchy.util.js';
import OperatorMapService from '../../services/recharge-admin/operatorMap.service.js';
import {
  RECHARGE_FEATURES,
  RECHARGE_SERVICE_CODE,
} from '../../config/constant.js';

export const fetchRechargePlans = async (req, res, next) => {
  try {
    const { operatorCode, circleCode } = req.query;
    const actor = req.user;

    const tenantChain = await buildTenantChain(actor.tenantId);

    // 1️⃣ Resolve service + feature + provider
    const { service, feature, provider } = await RechargeRuntimeService.resolve(
      {
        tenantChain,
        platformServiceCode: RECHARGE_SERVICE_CODE,
        featureCode: RECHARGE_FEATURES.FETCH_PLANS,
      },
    );

    // 2️⃣ Resolve operator mapping (feature-aware)
    const providerOperatorCode = await OperatorMapService.resolve({
      internalOperatorCode: operatorCode,
      platformServiceId: service.id,
      platformServiceFeatureId: feature.id,
      serviceProviderId: provider.providerId,
    });

    // 3️⃣ Load provider plugin
    const plugin = getRechargePlugin(provider.code, provider.config);

    // 4️⃣ Fetch plans using mapped provider code
    const plans = await plugin.fetchPlans({
      operatorCode: providerOperatorCode,
      circleCode,
    });

    res.json({ plans });
  } catch (err) {
    next(err);
  }
};
