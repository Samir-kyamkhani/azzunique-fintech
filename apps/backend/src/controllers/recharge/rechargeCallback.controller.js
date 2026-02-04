import RechargeCallbackService from '../../services/recharge/recharge-callback.service.js';

export const rechargeCallback = async (req, res) => {
  res.json({ success: true }); // FAST ACK

  // ✅ REAL CLIENT IP (proxy safe)
  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;

  setImmediate(() => {
    RechargeCallbackService.handle({
      query: req.query,
      headers: req.headers,
      ip: clientIp, // 👈 YAHI PASS KARO
      rawQuery: req.rawQuery, // 👈 middleware se
    }).catch(console.error);
  });
};
