/**
 * “Jo bhi KYC provider banna chahta hai, ye functions implement karne honge.”
 *  Aadhaar KYC Plugin Interface
 *
 * NOTE:
 * - OTP Send mandatory
 * - OTP Verify mandatory
 */

export default class AadhaarKycPluginInterface {
  constructor(config) {
    this.config = config;
  }

  // Step 1: Send OTP to Aadhaar linked mobile
  async sendOtp(_params) {
    throw new Error('sendOtp not implemented');
  }

  // Step 2: Verify OTP and fetch Aadhaar data
  async verifyOtp(_params) {
    throw new Error('verifyOtp not implemented');
  }
}
