ALTER TABLE `recharge_transactions` ADD `wallet_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `recharge_transactions` ADD `retry_count` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `recharge_transactions` ADD `last_retry_at` timestamp;