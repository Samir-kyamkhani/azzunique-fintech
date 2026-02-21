import RechargeRuntimeService from '../../services/recharge/rechargeRuntime.service.js';
import { getRechargePlugin } from '../../plugin_registry/recharge/pluginRegistry.js';
import { RECHARGE_SERVICE_CODE } from '../../config/constant.js';
import { buildTenantChain } from '../../lib/tenantHierarchy.util.js';

export const fetchRechargeOffers = async (req, res) => {
  const { operatorCode, mobileNumber } = req.query;
  const actor = req.user;

  const tenantChain = await buildTenantChain(actor.tenantId);

  const { service, provider } = await RechargeRuntimeService.resolve({
    tenantChain,
    platformServiceCode: RECHARGE_SERVICE_CODE,
    featureCode: 'FETCH_OFFERS',
  });

  const plugin = getRechargePlugin(
    provider.code, // ✅ MPLAN / RECHARGE_EXCHANGE
    provider.config,
  );

  const offers = await plugin.fetchOffers({
    operatorCode,
    mobileNumber,
  });

  res.json({ offers });
};
