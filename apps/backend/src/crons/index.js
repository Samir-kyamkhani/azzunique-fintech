import cron from 'node-cron';

import { startRechargeStatusCron } from './rechargeStatus.cron.js';
import { autoRetryPendingRecharges } from './rechargeAutoRetry.cron.js';
import { reconcileWallets } from './ledger.reconciliation.cron.js';
import { takeDailyWalletSnapshot } from './wallet.snapshot.cron.js';
import envConfig from '../config/config.js';
import { runMonthlySettlement } from './settlement.cron.js';

export function startAllCrons() {
  if (envConfig.enableCrons !== 'true') {
    console.log('⏭ All crons disabled');
    return;
  }

  // Recharge status polling
  startRechargeStatusCron();

  // Auto retry every 5 min
  cron.schedule('*/5 * * * *', autoRetryPendingRecharges);

  // Ledger reconciliation every night 2 AM
  cron.schedule('0 2 * * *', reconcileWallets);

  // Wallet snapshot daily at 12:05 AM
  cron.schedule('5 0 * * *', takeDailyWalletSnapshot);

  // Monthly settlement (1st day 1 AM)
  cron.schedule('0 1 1 * *', runMonthlySettlement);

  console.log('✅ All crons started');
}
