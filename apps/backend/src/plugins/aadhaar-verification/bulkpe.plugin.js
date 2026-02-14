import axios from 'axios';
import AadhaarKycPluginInterface from './bulkpe.interface.js';
import { ApiError } from '../../lib/ApiError.js';

class BulkpeAadhaarPlugin extends AadhaarKycPluginInterface {
  constructor(config) {
    super(config);

    this.client = axios.create({
      baseURL: this.config.bulkpeBaseUrl,
      timeout: 15000,
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Step 1: Send OTP
   */
  async sendOtp({ aadhaarNumber }) {
    try {
      const res = await this.client.post('/aadhaar/send-otp', {
        aadhaar_number: aadhaarNumber,
      });

      if (!res.data.success) {
        throw ApiError.badRequest(res.data.message || 'Failed to send OTP');
      }

      return {
        referenceId: res.data.data.reference_id,
        message: 'OTP sent successfully',
      };
    } catch (err) {
      throw ApiError.internal(
        err.response?.data?.message || 'Aadhaar OTP error',
      );
    }
  }

  /**
   * Step 2: Verify OTP
   */
  async verifyOtp({ referenceId, otp }) {
    try {
      const res = await this.client.post('/aadhaar/verify-otp', {
        reference_id: referenceId,
        otp,
      });

      if (!res.data.success) {
        throw ApiError.badRequest(
          res.data.message || 'OTP verification failed',
        );
      }

      return {
        aadhaarNumber: res.data.data.aadhaar_number,
        name: res.data.data.name,
        dob: res.data.data.dob,
        gender: res.data.data.gender,
        address: res.data.data.address,
        state: res.data.data.state,
        pincode: res.data.data.pincode,
      };
    } catch (err) {
      throw ApiError.internal(
        err.response?.data?.message || 'Aadhaar verification error',
      );
    }
  }
}

export default BulkpeAadhaarPlugin;
