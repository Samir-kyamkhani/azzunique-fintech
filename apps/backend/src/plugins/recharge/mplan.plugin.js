import axios from 'axios';
import MplanPluginInterface from './mplan.interface.js';
import { ApiError } from '../../lib/ApiError.js';

class MplanPlugin extends MplanPluginInterface {
  constructor(config) {
    super(config);
    this.client = axios.create({
      baseURL: this.config.mplanpluginUrl, //mplanpluginUrl
      timeout: 10000,
    });
  }

  async fetchPlans({ operatorCode, circleCode }) {
    const apiKey = this.config.apikey;

    const res = await this.client.get('/mobileplans', {
      params: {
        apikey: apiKey,
        operator_code: operatorCode,
        circle_code: circleCode,
      },
    });

    const { status, records } = res.data;

    if (status !== 1) {
      const message = records?.msg || 'MPLAN provider error';

      // If auth issue → better classification
      if (message.toLowerCase().includes('authorize')) {
        throw ApiError.internal(
          `MPLAN authorization failed. IP not whitelisted or invalid API key.`,
        );
      }

      throw ApiError.internal(`MPLAN error: ${message}`);
    }

    return records;
  }

  //futere:  ager jarurat hui to
  async fetchOffers({ operatorCode, mobileNumber }) {
    const { apiKey } = this.config;

    const res = await this.client.get('/mobile_roffer', {
      params: {
        apikey: apiKey,
        operator_code: operatorCode,
        mobile_number: mobileNumber,
      },
    });

    if (res.data.status !== 1) {
      throw ApiError.badRequest(
        res.data.records?.msg || 'Failed to fetch offers',
      );
    }

    return res.data.records;
  }
}

export default MplanPlugin;
