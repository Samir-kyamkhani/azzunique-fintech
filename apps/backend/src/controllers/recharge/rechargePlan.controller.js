import RechargeRuntimeService from '../../services/recharge/rechargeRuntime.service.js';
import { getRechargePlugin } from '../../plugin_registry/recharge/pluginRegistry.js';
import { buildTenantChain } from '../../lib/tenantHierarchy.util.js';
import {
  RECHARGE_FEATURES,
  RECHARGE_SERVICE_CODE,
} from '../../config/constant.js';

export const fetchRechargePlans = async (req, res) => {
  const { operatorCode, circleCode } = req.query;
  const actor = req.user;

  const tenantChain = await buildTenantChain(actor.tenantId);

  const { provider } = await RechargeRuntimeService.resolve({
    tenantChain,
    platformServiceCode: RECHARGE_SERVICE_CODE,
    featureCode: RECHARGE_FEATURES.FETCH_PLANS,
  });

  const plugin = getRechargePlugin(
    provider.code, // ✅ MPLAN / RECHARGE_EXCHANGE
    provider.config,
  );

  const plans = await plugin.fetchPlans({
    operatorCode,
    circleCode,
  });

  res.json({ plans });
};
