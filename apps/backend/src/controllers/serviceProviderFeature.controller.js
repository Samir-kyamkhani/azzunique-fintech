import spfService from '../services/serviceProviderFeature.service.js';

export const mapServiceProviderFeature = async (req, res) => {
  res.status(201).json(
    await spfService.map(
      {
        serviceProviderId: req.params.id, // providerId in params
        platformServiceFeatureId: req.body.platformServiceFeatureId,
      },
      req.user,
    ),
  );
};

export const listServiceProviderFeatures = async (req, res) => {
  res.json(await spfService.listByProvider(req.params.providerId));
};

export const unmapServiceProviderFeature = async (req, res) => {
  res.json(await spfService.unmap(req.params.id, req.user));
};
