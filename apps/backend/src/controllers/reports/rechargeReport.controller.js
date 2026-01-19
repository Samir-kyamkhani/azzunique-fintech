import RechargeReportService from '../../services/reports/rechargeReport.service.js';

export const listRechargeReports = async (req, res) => {
  const data = await RechargeReportService.list(req.query, req.user);
  res.json(data);
};
