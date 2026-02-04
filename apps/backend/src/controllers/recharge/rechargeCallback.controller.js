import RechargeCallbackService from '../../services/recharge/recharge-callback.service.js';

export const rechargeCallback = async (req, res) => {
  // ✅ ACK FIRST (provider requirement)
  res.json({ success: true });

  setImmediate(() => {
    RechargeCallbackService.handle(req.query).catch((err) => {
      console.error('Recharge callback service error:', err);
    });
  });
};
