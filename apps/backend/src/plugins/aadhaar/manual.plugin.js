import AadhaarPluginInterface from './bulkpe.interface.js';

class ManualAadhaarPlugin extends AadhaarPluginInterface {
  /**
   * Manual flow me OTP nahi hota
   */
  async sendOtp() {
    return {
      referenceId: null,
      raw: {
        status: true,
        message: 'Manual KYC does not require OTP',
      },
    };
  }

  /**
   * Manual verify = form data accept karna
   */
  async verifyOtp({ aadhaarNumber, formData, files }) {
    if (!aadhaarNumber) {
      throw new Error('Aadhaar number missing');
    }

    if (!files?.profilePhoto?.[0]) {
      throw new Error('Profile photo missing');
    }

    if (!files?.aadhaarPhoto?.[0]) {
      throw new Error('Aadhaar photo missing');
    }

    const masked = `XXXX-XXXX-${aadhaarNumber.slice(-4)}`;

    // Example file metadata extraction
    const profilePhotoFile = files.profilePhoto[0];
    const aadhaarPhotoFile = files.aadhaarPhoto[0];

    return {
      data: {
        status: 'PENDING',
        aadhaarData: {
          name: formData.fullName || formData.name,
          dob: formData.dob,
          address: formData.address,
          gender: formData.gender,
          maskedAadhaar: masked,
        },
        documents: {
          profilePhoto: {
            originalName: profilePhotoFile.originalname,
            mimeType: profilePhotoFile.mimetype,
            size: profilePhotoFile.size,
          },
          aadhaarPhoto: {
            originalName: aadhaarPhotoFile.originalname,
            mimeType: aadhaarPhotoFile.mimetype,
            size: aadhaarPhotoFile.size,
          },
        },
      },
      raw: {
        source: 'MANUAL',
        submittedAt: new Date(),
      },
    };
  }
}

export default ManualAadhaarPlugin;
