export function rawQueryMiddleware(req, res, next) {
  // originalUrl = /api/recharge/callback?status=SUCCESS&yourtransid=123
  const url = req.originalUrl || '';

  const idx = url.indexOf('?');

  req.rawQuery = idx !== -1 ? url.slice(idx + 1) : '';

  next();
}
