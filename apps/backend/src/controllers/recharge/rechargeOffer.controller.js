import RechargeRuntimeService from '../../services/recharge/rechargeRuntime.service.js';
import { getRechargePlugin } from '../../plugin_registry/pluginRegistry.js';

export const fetchRechargeOffers = async (req, res) => {
  const { operatorCode, mobileNumber } = req.query;
  const actor = req.user;

  const tenantChain = [
    actor.tenantId,
    actor.whiteLabelTenantId,
    actor.resellerTenantId,
    actor.azzuniqueTenantId,
  ].filter(Boolean);

  const { provider } = await RechargeRuntimeService.resolve({
    tenantChain,
    platformServiceCode: 'RECHARGE',
  });

  const plugin = getRechargePlugin(provider.serviceProviderId, provider.config);

  const offers = await plugin.fetchOffers({
    operatorCode,
    mobileNumber,
  });

  res.json({ offers });
};
