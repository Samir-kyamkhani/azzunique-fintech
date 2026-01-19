import CommissionReportService from '../../services/reports/commissionReport.service.js';

export const listCommissionReports = async (req, res) => {
  const data = await CommissionReportService.list(req.query, req.user);
  res.json(data);
};
