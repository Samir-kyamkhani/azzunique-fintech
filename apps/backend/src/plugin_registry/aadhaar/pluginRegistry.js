import { ApiError } from '../../lib/ApiError.js';
import BulkpeAadhaarPlugin from '../../plugins/aadhaar/bulkpe.plugin.js';
// import InstantpayAadhaarPlugin from '../../plugins/kyc/instantpay.aadhaar.plugin.js';

// Central KYC plugin resolver
export function getAadhaarPlugin(providerCode, config) {
  switch (providerCode) {
    case 'BULKPE':
      return new BulkpeAadhaarPlugin(config);

    // case 'INSTANTPAY':
    //   return new InstantpayAadhaarPlugin(config);

    default:
      throw ApiError.internal('Unknown Aadhaar KYC provider');
  }
}
