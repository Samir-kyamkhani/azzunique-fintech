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
  async verifyOtp({ aadhaarNumber, formData }) {
    const masked = `XXXX-XXXX-${aadhaarNumber.slice(-4)}`;

    return {
      verificationStatus: 'PENDING', // Admin review karega
      aadhaarData: {
        name: formData.name,
        dob: formData.dob,
        address: formData.address,
        gender: formData.gender,
        maskedAadhaar: masked,
      },
      raw: {
        source: 'MANUAL',
        submittedData: formData,
        submittedAt: new Date(),
      },
    };
  }
}

export default ManualAadhaarPlugin;
