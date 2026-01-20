import { SmtpConfigService } from '../services/SmtpConfig.service.js';

export const createSmtpConfig = async (req, res, next) => {
  try {
    const config = await SmtpConfigService.create(req.body, req.user);
    res.status(201).json(config);
  } catch (err) {
    next(err);
  }
};

export const updateSmtpConfig = async (req, res, next) => {
  try {
    const config = await SmtpConfigService.update(
      req.params.id,
      req.body,
      req.user,
    );
    res.json(config);
  } catch (err) {
    next(err);
  }
};

export const getSmtpConfigById = async (req, res, next) => {
  try {
    const config = await SmtpConfigService.getById(req.params.id, req.user);
    res.json(config);
  } catch (err) {
    next(err);
  }
};
