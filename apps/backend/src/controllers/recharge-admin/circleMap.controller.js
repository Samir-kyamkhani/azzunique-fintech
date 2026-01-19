import CircleMapService from '../../services/recharge-admin/circleMap.service.js';

// AZZUNIQUE ONLY Create / Update circle mapping
export const upsertCircleMap = async (req, res) => {
  const result = await CircleMapService.upsert(req.body, req.user);
  res.status(201).json(result);
};

// AZZUNIQUE ONLY  List all circle mappings
export const listCircleMaps = async (_req, res) => {
  const data = await CircleMapService.list();
  res.json(data);
};
