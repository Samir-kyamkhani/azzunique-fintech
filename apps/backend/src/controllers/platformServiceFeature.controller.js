import featureService from '../services/platformServiceFeature.service.js';

export const createPlatformServiceFeature = async (req, res) => {
  const result = await featureService.create(req.body, req.user);
  res.status(201).json(result);
};
