import { Router } from 'express';
import { AuthMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/zod-validate.js';

import * as RechargeReport from '../../controllers/reports/rechargeReport.controller.js';
import * as CommissionReport from '../../controllers/reports/commissionReport.controller.js';
import * as WalletLedger from '../../controllers/reports/walletLedger.controller.js';

import { rechargeReportSchema } from '../../validators/reports/rechargeReport.schema.js';
import { commissionReportSchema } from '../../validators/reports/commissionReport.schema.js';
import { walletLedgerSchema } from '../../validators/reports/walletLedger.schema.js';

const router = Router();
router.use(AuthMiddleware);

router.get(
  '/recharges',
  validate({ query: rechargeReportSchema }),
  RechargeReport.listRechargeReports,
);
router.get(
  '/commissions',
  validate({ query: commissionReportSchema }),
  CommissionReport.listCommissionReports,
);
router.get(
  '/wallet-ledger',
  validate({ query: walletLedgerSchema }),
  WalletLedger.listWalletLedger,
);

export default router;
