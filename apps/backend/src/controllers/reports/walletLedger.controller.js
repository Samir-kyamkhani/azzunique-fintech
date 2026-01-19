import WalletLedgerService from '../../services/reports/walletLedger.service.js';

export const listWalletLedger = async (req, res) => {
  const data = await WalletLedgerService.list(req.query, req.user);
  res.json(data);
};
