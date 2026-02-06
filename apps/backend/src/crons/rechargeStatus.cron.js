import cron from 'node-cron';
import RechargeStatusService from '../services/recharge/rechargeStatus.service.js';
import envConfig from '../config/config.js';

export function startRechargeStatusCron() {
  if (envConfig.enableCrons !== 'true') {
    console.log('⏭ Recharge status cron disabled');
    return;
  }

  cron.schedule('*/5 * * * *', async () => {
    try {
      await RechargeStatusService.processPendingTransactions();
    } catch (err) {
      console.error('[CRON] Recharge status error', err);
    }
  });

  console.log('✅ Recharge status cron started');
}
