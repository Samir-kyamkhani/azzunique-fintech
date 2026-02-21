import RechargeRuntimeService from '../../services/recharge/rechargeRuntime.service.js';
import OperatorMapService from '../../services/recharge-admin/operatorMap.service.js';
import { RECHARGE_SERVICE_CODE } from '../../config/constant.js';
import { buildTenantChain } from '../../lib/tenantHierarchy.util.js';

export const fetchRechargeOperators = async (req, res) => {
  const tenantChain = await buildTenantChain(req.user.tenantId);

  // Resolve TRANSACTION provider
  const { service, provider } = await RechargeRuntimeService.resolve({
    tenantChain,
    platformServiceCode: RECHARGE_SERVICE_CODE,
    featureCode: 'RECHARGE',
  });

  // Only transaction provider mappings
  const operators = await OperatorMapService.listForRecharge({
    platformServiceId: service.id,
    serviceProviderId: provider.providerId,
  });

  res.json({
    success: true,
    data: operators,
  });
};
