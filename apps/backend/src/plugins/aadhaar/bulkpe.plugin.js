import axios from 'axios';
import AadhaarPluginInterface from './bulkpe.interface.js';
import { ApiError } from '../../lib/ApiError.js';

class BulkpeAadhaarPlugin extends AadhaarPluginInterface {
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

  // Step 1: Send OTP
  async verifyAadhar({ aadhaarNumber }) {
    try {
      const response = await this.client.post('/verifyAadhar', {
        aadhaar: aadhaarNumber,
      });

      const data = response.data;

      if (!data.status) {
        throw ApiError.badRequest(data.message || 'Failed to send OTP');
      }

      return data;
    } catch (err) {
      throw ApiError.internal(
        err.response?.data?.message || 'Aadhaar OTP request failed',
      );
    }
  }

  // Step 2: Verify OTP
  async verifyAadharOtp({ referenceId, otp }) {
    try {
      const response = await this.client.post('/verifyAadharOtp', {
        ref_id: referenceId,
        otp,
      });

      const data = response.data;

      if (!data.status) {
        throw ApiError.badRequest(data.message || 'OTP verification failed');
      }

      return data;
    } catch (err) {
      throw ApiError.internal(
        err.response?.data?.message || 'Aadhaar verification failed',
      );
    }
  }
}

export default BulkpeAadhaarPlugin;
