import { SmtpConfigService } from '../services/SmtpConfig.service.js';

export const createSmtpConfig = async (req, res, next) => {
  try {
    const config = await SmtpConfigService.create(req.body);
    res.status(201).json(config);
  } catch (err) {
    next(err);
  }
};

export const updateSmtpConfig = async (req, res, next) => {
  try {
    const config = await SmtpConfigService.update(req.params.id, req.body);
    res.json(config);
  } catch (err) {
    next(err);
  }
};

export const getSmtpConfigById = async (req, res, next) => {
  try {
    const config = await SmtpConfigService.getById(req.params.id);
    res.json(config);
  } catch (err) {
    next(err);
  }
};
