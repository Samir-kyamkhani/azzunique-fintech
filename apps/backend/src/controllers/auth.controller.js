import authService from '../services/auth.service.js';
import { cookieOptions, refreshCookieOptions } from '../lib/auth.cookies.js';

export const login = async (req, res) => {
  const result =
    data.type === 'EMPLOYEE'
      ? await authService.loginEmployee(req.body)
      : await authService.loginUser(req.body);

  const { accessToken, refreshToken, ...rest } = result;

  res
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, refreshCookieOptions)
    .json(rest);
};

export const logout = async (req, res) => {
  await authService.logout({
    userId: req.user.sub,
    type: req.user.type,
  });

  res
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', refreshCookieOptions)
    .json(null);
};
