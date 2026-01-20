import cron from 'node-cron';
import RechargeStatusService from '../services/recharge/rechargeStatus.service.js';
import envConfig from '../config/config.js';

export function startRechargeStatusCron() {
  if (envConfig.enableRechargeCron !== 'true') {
    console.log('⏭ Recharge cron disabled');
    return;
  }

  console.log('⏱ Recharge cron scheduled (every 5 minutes)');

  cron.schedule('*/5 * * * *', async () => {
    console.log('[CRON] Recharge status polling started');

    try {
      await RechargeStatusService.processPendingTransactions();
      console.log('[CRON] Recharge status polling finished');
    } catch (err) {
      if (err?.code === 'ER_NO_SUCH_TABLE' || err?.sqlState === '42S02') {
        console.warn(
          '[CRON] recharge_transactions table missing, skipping cron run',
        );
        return;
      }

      console.error('[CRON] Recharge polling error', err);
    }
  });
}
