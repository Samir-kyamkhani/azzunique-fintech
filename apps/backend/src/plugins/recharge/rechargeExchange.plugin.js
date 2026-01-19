import axios from 'axios';
import RechargePlugin from './recharge.interface.js';
import { ApiError } from '../../lib/ApiError.js';
import envConfig from '../../config/config.js';

class RechargeExchangePlugin extends RechargePlugin {
  constructor(config) {
    super(config);

    this.txClient = axios.create({
      baseURL: envConfig.rechage.rechargeExchangePluginUrl,
      timeout: 15000,
    });

    this.statusClient = axios.create({
      baseURL: envConfig.rechage.rechargeExchangeStatusPluginUrl,
      timeout: 15000,
    });
  }

  async recharge({ opcode, number, amount, transid }) {
    const { userId, token } = this.config;

    const res = await this.txClient.get('/Transaction', {
      params: {
        userid: userId,
        token,
        opcode,
        number,
        amount,
        transid,
      },
    });

    return res.data;
  }

  async checkStatus({ transid }) {
    const { userId, token } = this.config;

    const res = await this.statusClient.get('/TransactionStatus', {
      params: {
        userid: userId,
        token,
        transid,
      },
    });

    return res.data;
  }

  async fetchBalance() {
    const { userId, token } = this.config;

    const res = await this.statusClient.get('/BalanceNew', {
      params: {
        userid: userId,
        token,
      },
    });

    if (res.data.status !== 'SUCCESS') {
      throw ApiError.badRequest('Unable to fetch provider balance');
    }

    return res.data;
  }

  async complain({ referenceId, remark }) {
    const { userId, token } = this.config;

    const res = await this.txClient.get('/Complain', {
      params: {
        userid: userId,
        token,
        referenceid: referenceId,
        remark,
      },
    });

    return res.data;
  }
}

export default RechargeExchangePlugin;
