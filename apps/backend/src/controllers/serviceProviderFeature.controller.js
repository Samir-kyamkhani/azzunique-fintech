import spfService from '../../services/platform/serviceProviderFeature.service.js';

export const mapServiceProviderFeature = async (req, res) => {
  const result = await spfService.map(req.body, req.user);
  res.status(201).json(result);
};
