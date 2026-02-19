ALTER TABLE `ledgers` DROP FOREIGN KEY `ledger_transaction_fk`;
--> statement-breakpoint
DROP INDEX `idx_ledger_transaction` ON `ledgers`;