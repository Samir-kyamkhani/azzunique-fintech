import RechargeTransactionService from '../../services/recharge/rechargeTransaction.service.js';

export const initiateRecharge = async (req, res) => {
  const result = await RechargeTransactionService.initiateRecharge({
    payload: req.body,
    actor: req.user,
  });

  res.status(201).json(result);
};

export const fetchRechargeHistory = async (req, res) => {
  const result = await RechargeTransactionService.fetchHistory({
    actor: req.user,
    query: req.query,
  });

  res.json(result);
};
