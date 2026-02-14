import AadhaarService from '../../services/aadhaar/aadhaar.service.js';

export const sendOtp = async (req, res) => {
  const result = await AadhaarService.sendOtp({
    payload: req.body,
    actor: req.user,
  });

  res.status(201).json(result);
};

export const verifyOtp = async (req, res) => {
  const result = await AadhaarService.verifyOtp({
    payload: req.body,
    actor: req.user,
  });

  res.json(result);
};
