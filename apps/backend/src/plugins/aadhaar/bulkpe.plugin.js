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

  // STEP 1: SEND OTP
  async sendOtp({ aadhaarNumber }) {
    try {
      const response = await this.client.post('/verifyAadhar', {
        aadhaar: aadhaarNumber,
      });

      const data = response.data;

      if (!data.status) {
        throw ApiError.badRequest(data.message || 'Failed to send OTP');
      }

      return {
        referenceId: data.data.ref_id,
        raw: data,
      };
    } catch (err) {
      throw ApiError.internal(
        err.response?.data?.message || 'Aadhaar OTP request failed',
      );
    }
  }

  // STEP 2: VERIFY OTP
  async verifyOtp({ referenceId, otp }) {
    try {
      const response = await this.client.post('/verifyAadharOtp', {
        ref_id: referenceId,
        otp,
      });

      const data = response.data;

      if (!data.status) {
        throw ApiError.badRequest(data.message || 'OTP verification failed');
      }

      const aadhaarData = data.data;

      return {
        verificationStatus: 'VERIFIED',
        aadhaarData: {
          name: aadhaarData.name,
          dob: aadhaarData.dob,
          gender: aadhaarData.gender,
          address: aadhaarData.address,
          yearOfBirth: aadhaarData.year_of_birth,
          mobileHash: aadhaarData.mobile_hash,
        },
        raw: data,
      };
    } catch (err) {
      throw ApiError.internal(
        err.response?.data?.message || 'Aadhaar verification failed',
      );
    }
  }
}

export default BulkpeAadhaarPlugin;
