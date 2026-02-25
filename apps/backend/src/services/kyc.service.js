import AadhaarService from './aadhaar/aadhaar.service.js';
import { ApiError } from '../lib/ApiError.js';

class KycService {
  static async sendOtp(type, payload, actor) {
    switch (type.toLowerCase()) {
      case 'aadhaar':
        return AadhaarService.sendOtp({
          ...payload,
          actor,
        });

      default:
        throw ApiError.badRequest('Invalid KYC type');
    }
  }

  static async verify(type, payload, actor, files) {
    switch (type.toLowerCase()) {
      case 'aadhaar':
        return AadhaarService.verify({
          ...payload,
          actor,
          files,
        });

      default:
        throw ApiError.badRequest('Invalid KYC type');
    }
  }

  static async getStatus(type, actor) {
    switch (type.toLowerCase()) {
      case 'aadhaar':
        return AadhaarService.getStatus(actor);

      default:
        throw ApiError.badRequest('Invalid KYC type');
    }
  }
}

export default KycService;
