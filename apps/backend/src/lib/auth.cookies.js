export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};
// export const cookieOptions = {
//   httpOnly: true,
//   secure: false, // HTTP
//   sameSite: 'lax',
//   path: '/', 
//   domain: '.147.93.20.127.sslip.io',
//   maxAge: 24 * 60 * 60 * 1000,
// };

// export const refreshCookieOptions = {
//   httpOnly: true,
//   secure: false,
//   sameSite: 'lax',
//   path: '/',
//   domain: '.147.93.20.127.sslip.io',
//   maxAge: 7 * 24 * 60 * 60 * 1000,
// };

export const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
