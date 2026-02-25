import AadhaarService from '../services/aadhaar/aadhaar.service.js';
import KycService from '../services/kyc.service.js';

export const sendOtp = async (req, res) => {
  const { type } = req.params;
  const result = await KycService.sendOtp(type, req.body, req.user);
  res.status(201).json(result);
};

export const verify = async (req, res) => {
  const { type } = req.params;
  const result = await KycService.verify(type, req.body, req.user, req?.files);
  res.status(200).json(result);
};

export const getStatus = async (req, res) => {
  const { type } = req.params;
  const result = await KycService.getStatus(type, req.user);
  res.status(200).json(result);
};

export const upload = async (req, res) => {
  try {
    const { photo_link } = req.body;

    const result = await AadhaarService.decodeAndSave(photo_link);

    return res.json({
      success: true,
      message: 'Photo saved successfully',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
