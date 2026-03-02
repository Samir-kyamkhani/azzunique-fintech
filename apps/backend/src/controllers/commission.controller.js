import CommissionSettingService from '../services/commission-setting.service.js';

export const setCommission = async (req, res) => {
  const result = await CommissionSettingService.setRule(req.body, req.user);

  res.status(201).json(result);
};

export const getAllCommissionList = async (req, res) => {
  const result = await CommissionSettingService.getCommissionList(
    req.user,
    req.query,
  );
  res.status(200).json({
    data: result.data,
    meta: result.meta,
    message: 'Fetched successfully',
  });
};
