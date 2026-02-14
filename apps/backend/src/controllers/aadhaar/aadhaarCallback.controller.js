import AadhaarCallbackService from '../../services/aadhaar/aadhaar-callback.service.js';

export const aadhaarCallback = async (req, res) => {
  // 🔥 Always FAST ACK to provider
  res.json({ success: true });

  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;

  setImmediate(() => {
    AadhaarCallbackService.handle({
      body: req.body,
      query: req.query,
      headers: req.headers,
      ip: clientIp,
      rawBody: req.rawBody || '',
    }).catch((err) => {
      console.error('[AadhaarCallbackService Error]', err);
    });
  });
};
