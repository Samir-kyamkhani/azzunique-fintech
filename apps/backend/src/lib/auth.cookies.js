const getRootDomain = (req) => {
  const host = req.headers['x-forwarded-host'] || req.headers.host || '';

  const hostname = host.split(',')[0].split(':')[0].toLowerCase();

  const parts = hostname.split('.');
  if (parts.length <= 2) return hostname; // localhost / IP

  return '.' + parts.slice(-2).join('.');
};

const isProd = process.env.NODE_ENV === 'production';

export const accessCookieOptions = (req) => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  domain: isProd ? getRootDomain(req) : null,
  path: '/',
  maxAge: 24 * 60 * 60 * 1000,
});

export const refreshCookieOptions = (req) => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  domain: isProd ? getRootDomain(req) : null,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
