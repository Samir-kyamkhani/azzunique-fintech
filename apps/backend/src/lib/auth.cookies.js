const isProd = process.env.NODE_ENV === 'production';

export const accessCookieOptions = () => ({
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax', // 🔑 KEY
  path: '/',
  maxAge: 24 * 60 * 60 * 1000,
});

export const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
