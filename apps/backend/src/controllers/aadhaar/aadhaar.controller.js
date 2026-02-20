import AadhaarService from '../../services/aadhaar/aadhaar.service.js';

export const sendOtp = async (req, res) => {
  const result = await AadhaarService.sendOtp({
    aadhaarNumber: req.body.aadhaarNumber,
    actor: req.user,
  });

  res.status(201).json(result);
};

export const verifyAadhaar = async (req, res) => {
  const result = await AadhaarService.verifyAadhaary({
    transactionId: req.body.transactionId,
    otp: req.body.otp,
    formData: req.body.formData,
    actor: req.user,
  });

  res.json(result);
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
