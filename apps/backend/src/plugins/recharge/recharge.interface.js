/**
 *  Recharge Plugin Interface
 *
 * NOTE:
 * - Plan / Offer optional
 * - Transaction mandatory
 */
export default class RechargePlugin {
  constructor(config) {
    this.config = config;
  }

  // Optional (MPLAN)
  async fetchPlans(_params) {
    throw new Error('fetchPlans not implemented');
  }

  async fetchOffers(_params) {
    throw new Error('fetchOffers not implemented');
  }

  // Mandatory (RechargeExchange)
  async recharge(_params) {
    throw new Error('recharge not implemented');
  }

  async checkStatus(_params) {
    throw new Error('checkStatus not implemented');
  }

  async fetchBalance() {
    throw new Error('fetchBalance not implemented');
  }

  async complain(_params) {
    throw new Error('complain not implemented');
  }
}
