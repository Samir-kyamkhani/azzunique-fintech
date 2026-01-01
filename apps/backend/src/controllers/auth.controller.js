import authService from '../services/auth.service.js';
import { cookieOptions, refreshCookieOptions } from './auth.cookies.js';

export const login = async (req, res) => {
  const { identifier, password, tenantId, type } = req.body;

  const result =
    type === 'EMPLOYEE'
      ? await authService.loginEmployee({ identifier, password, tenantId })
      : await authService.loginUser({ identifier, password, tenantId });

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
