ALTER TABLE `recharge_transactions` ADD `next_status_check_at` timestamp;--> statement-breakpoint
ALTER TABLE `recharge_transactions` ADD `poll_attempt` int DEFAULT 0;