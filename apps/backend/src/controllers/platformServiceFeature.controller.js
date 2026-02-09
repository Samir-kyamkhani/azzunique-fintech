import PlatformServiceFeatureService from '../services/platformServiceFeature.service.js';

export const createPlatformServiceFeature = async (req, res) => {
  const result = await PlatformServiceFeatureService.create(req.body, req.user);

  res.status(201).json(result);
};

export const listPlatformServicesFeatures = async (req, res) => {
  const features = await PlatformServiceFeatureService.listAllFeatures();

  res.json(features);
};

export const listPlatformServiceFeatures = async (req, res) => {
  const { serviceId } = req.params;

  const features = await PlatformServiceFeatureService.listByService(serviceId);

  res.json(features);
};

export const updatePlatformServiceFeature = async (req, res) => {
  const { id } = req.params;

  const result = await PlatformServiceFeatureService.update(
    id,
    req.body,
    req.user,
  );

  res.json(result);
};

export const deletePlatformServiceFeature = async (req, res) => {
  const { id } = req.params;

  const result = await PlatformServiceFeatureService.delete(id, req.user);

  res.json(result);
};
