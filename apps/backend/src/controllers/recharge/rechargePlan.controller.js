import RechargeRuntimeService from '../../services/recharge/rechargeRuntime.service.js';
import { getRechargePlugin } from '../../plugin_registry/pluginRegistry.js';

export const fetchRechargePlans = async (req, res) => {
  const { operatorCode, circleCode } = req.query;
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

  const plans = await plugin.fetchPlans({
    operatorCode,
    circleCode,
  });

  res.json({ plans });
};
