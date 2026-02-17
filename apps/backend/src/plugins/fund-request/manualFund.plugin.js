import ManualFundPluginInterface from './manualFund.interface.js';

class ManualFundPlugin extends ManualFundPluginInterface {
  async createTransaction({ amount, transid, paymentMode }) {
    const instructions = {};

    if (paymentMode === 'UPI') {
      instructions.upiId = this.config.upiId;
    }

    if (paymentMode === 'BANK_TRANSFER') {
      instructions.bankName = this.config.bankName;
      instructions.accountNumber = this.config.accountNumber;
      instructions.ifsc = this.config.ifsc;
      instructions.accountHolder = this.config.accountHolder;
    }

    return {
      providerTxnId: transid,
      status: 'PENDING',
      instructions,
      amount,
    };
  }

  async changeStatus({ transid, status }) {
    return {
      providerTxnId: transid,
      status,
    };
  }

  async refund({ transid, amount }) {
    return {
      providerTxnId: transid,
      refundedAmount: amount,
      status: 'REFUNDED',
    };
  }
}

export default ManualFundPlugin;
