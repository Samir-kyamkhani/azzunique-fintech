import OperatorMapService from '../../services/recharge-admin/operatorMap.service.js';

// AZZUNIQUE ONLY Create / Update operator mapping
export const upsertOperatorMap = async (req, res) => {
  const result = await OperatorMapService.upsert(req.body, req.user);
  res.status(201).json(result);
};

// AZZUNIQUE ONLY List all operator mappings
export const listOperatorMaps = async (_req, res) => {
  const data = await OperatorMapService.list();
  res.json(data);
};
