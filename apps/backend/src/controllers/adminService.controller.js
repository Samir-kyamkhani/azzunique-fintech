import PlatformService from '../services/platformService.service.js';
import PlatformServiceFeature from '../services/platformServiceFeature.service.js';
import ProviderService from '../services/serviceProvider.service.js';
import ProviderFeatureService from '../services/serviceProviderFeature.service.js';
import PSPService from '../services/platformServiceProviderService.service.js';

/* SERVICES */

export const createService = async (req, res) =>
  res.json(await PlatformService.create(req.body, req.user));

export const listServices = async (req, res) =>
  res.json(await PlatformService.list());

export const getService = async (req, res) =>
  res.json(await PlatformService.getById(req.params.id));

export const updateService = async (req, res) =>
  res.json(await PlatformService.update(req.params.id, req.body, req.user));

export const deleteService = async (req, res) =>
  res.json(await PlatformService.delete(req.params.id, req.user));

/* FEATURES */

export const createFeature = async (req, res) =>
  res.json(
    await PlatformServiceFeature.create(
      {
        ...req.body,
        platformServiceId: req.params.serviceId,
      },
      req.user,
    ),
  );

export const listFeatures = async (req, res) =>
  res.json(await PlatformServiceFeature.listByService(req.params.serviceId));

export const updateFeature = async (req, res) =>
  res.json(
    await PlatformServiceFeature.update(
      req.params.featureId,
      req.body,
      req.user,
    ),
  );

export const deleteFeature = async (req, res) =>
  res.json(await PlatformServiceFeature.delete(req.params.featureId, req.user));

/* PROVIDERS */

export const createProvider = async (req, res) =>
  res.json(await ProviderService.create(req.body, req.user));

export const listAllProviders = async (req, res) =>
  res.json(await ProviderService.list());

export const updateProvider = async (req, res) =>
  res.json(
    await ProviderService.update(req.params.providerId, req.body, req.user),
  );

export const deleteProvider = async (req, res) =>
  res.json(await ProviderService.delete(req.params.providerId, req.user));

/* SERVICE ↔ PROVIDER */

export const assignProviderToService = async (req, res) =>
  res.json(
    await PSPService.assign(
      {
        platformServiceId: req.params.serviceId,
        serviceProviderId: req.body.providerId,
        config: req.body.config || {},
      },
      req.user,
    ),
  );

export const unassignProviderFromService = async (req, res) =>
  res.json(
    await PSPService.disable(
      req.params.serviceId,
      req.params.providerId,
      req.user,
    ),
  );

export const listProviders = async (req, res) =>
  res.json(await PSPService.listByService(req.params.serviceId));

export const updateProviderConfig = async (req, res) =>
  res.json(
    await PSPService.updateConfig(
      req.params.serviceId,
      req.params.providerId,
      req.body.config,
      req.user,
    ),
  );

/* PROVIDER FEATURE */

export const mapProviderFeature = async (req, res) =>
  res.json(
    await ProviderFeatureService.map(
      {
        serviceProviderId: req.params.providerId,
        platformServiceFeatureId: req.body.platformServiceFeatureId,
      },
      req.user,
    ),
  );

export const unmapProviderFeature = async (req, res) =>
  res.json(
    await ProviderFeatureService.unmap(
      req.params.providerId,
      req.params.featureId,
      req.user,
    ),
  );
