import { db } from '../database/core/core-db.js';
import { walletTable } from '../models/core/index.js';
import { eq } from 'drizzle-orm';
import WalletService from '../services/wallet.service.js';

export async function runSettlement({ tenantId }) {
  const commissionWallets = await db
    .select()
    .from(walletTable)
    .where(
      and(
        eq(walletTable.walletType, 'COMMISSION'),
        eq(walletTable.tenantId, tenantId),
      ),
    );

  const [settlementWallet] = await db
    .select()
    .from(walletTable)
    .where(
      and(
        eq(walletTable.walletType, 'SETTLEMENT'),
        eq(walletTable.tenantId, tenantId),
      ),
    )
    .limit(1);

  if (!settlementWallet) return;

  for (const wallet of commissionWallets) {
    if (wallet.balance <= 0) continue;

    const amount = wallet.balance;

    await db.transaction(async () => {
      // Debit from commission wallet
      await WalletService.debitWallet({
        walletId: wallet.id,
        amount,
        reference: `SETTLEMENT:${settlementWallet.id}:${wallet.id}`,
      });

      // Credit to settlement wallet
      await WalletService.creditWallet({
        walletId: settlementWallet.id,
        amount,
        reference: `SETTLEMENT:${wallet.id}:${settlementWallet.id}`,
      });
    });
  }
}
