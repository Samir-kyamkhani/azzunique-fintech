import cron from 'node-cron';
import RechargeStatusService from '../services/recharge/rechargeStatus.service.js';

export function startRechargeStatusCron() {
  //  Every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('[CRON] Recharge status polling started');
      await RechargeStatusService.processPendingTransactions();
      console.log('[CRON] Recharge status polling finished');
    } catch (err) {
      console.error('[CRON] Recharge polling error', err);
    }
  });
}
