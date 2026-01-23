import authService from '../services/auth.service.js';
import {
  accessCookieOptions,
  refreshCookieOptions,
} from '../lib/auth.cookies.js';

export const login = async (req, res) => {
  const data = req.body;

  const result =
    data.type === 'EMPLOYEE'
      ? await authService.loginEmployee(data)
      : await authService.loginUser(req.context, data);

  const { accessToken, refreshToken, ...rest } = result;

  res
    .cookie('accessToken', accessToken, accessCookieOptions(req))
    .cookie('refreshToken', refreshToken, refreshCookieOptions(req))
    .json(rest);
};

export const logout = async (req, res) => {
  await authService.logout({
    userId: req.user.id,
    type: req.user.type,
  });

  res
    .clearCookie('accessToken', accessCookieOptions)
    .clearCookie('refreshToken', refreshCookieOptions)
    .json({ data: null, message: 'logout success' });
};

export const getCurrentUser = async (req, res) => {
  const user = await authService.getCurrentUser(req.user);

  res.json({
    data: user,
    message: 'current user',
  });
};
