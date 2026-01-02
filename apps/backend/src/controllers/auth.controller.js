import authService from '../services/auth.service.js';
import { cookieOptions, refreshCookieOptions } from '../lib/auth.cookies.js';

export const login = async (req, res) => {
  const data = req.body;

  const result =
    data.type === 'EMPLOYEE'
      ? await authService.loginEmployee(data)
      : await authService.loginUser(data);

  const { accessToken, refreshToken, ...rest } = result;

  res
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, refreshCookieOptions)
    .json(rest);
};

export const logout = async (req, res) => {
  await authService.logout({
    userId: req.user.id,
    type: req.user.type,
  });

  res
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', refreshCookieOptions)
    .json({ data: null, message: 'logout success' });
};
