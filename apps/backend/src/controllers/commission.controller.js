import CommissionSettingService from '../services/commission-setting.service.js';

export const setUserCommission = async (req, res) => {
  const result = await CommissionSettingService.setUserRule(req.body, req.user);
  res.status(201).json(result);
};

export const setRoleCommission = async (req, res) => {
  const result = await CommissionSettingService.setRoleRule(req.body, req.user);
  res.status(201).json(result);
};
