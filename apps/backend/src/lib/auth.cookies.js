const getRootDomain = (hostname) => {
  const parts = hostname.split('.');
  return '.' + parts.slice(-2).join('.');
};

export const accessCookieOptions = (req) => ({
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  domain: getRootDomain(req.hostname),
  path: '/',
  maxAge: 24 * 60 * 60 * 1000, // 1 day
});

export const refreshCookieOptions = (req) => ({
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  domain: getRootDomain(req.hostname),
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
