CREATE TABLE `wallet_snapshots` (
	`id` varchar(36) NOT NULL,
	`wallet_id` varchar(36) NOT NULL,
	`balance` int NOT NULL,
	`blocked_amount` int NOT NULL,
	`snapshot_date` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wallet_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `wallets` ADD `blocked_amount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `wallet_snapshots` ADD CONSTRAINT `wallet_snapshots_wallet_id_wallets_id_fk` FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_wallet_snapshots_wallet` ON `wallet_snapshots` (`wallet_id`);