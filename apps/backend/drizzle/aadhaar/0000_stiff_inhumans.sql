CREATE TABLE `aadhaar_transactions` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`user_id` varchar(36) NOT NULL,
	`users_kyc_id` varchar(36),
	`tenant_id` varchar(36) NOT NULL,
	`masked_aadhaar` varchar(20) NOT NULL,
	`aadhaar_encrypted` varchar(255) NOT NULL,
	`reference_id` varchar(100),
	`provider_txn_id` varchar(100),
	`provider_config` json,
	`provider_code` varchar(40) NOT NULL,
	`provider_response` json,
	`status` varchar(20) NOT NULL,
	`failure_reason` varchar(255),
	`attempt_count` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `aadhaar_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `aadhaar_transactions` ADD CONSTRAINT `aadhaar_transactions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aadhaar_transactions` ADD CONSTRAINT `aadhaar_transactions_users_kyc_id_users_kyc_id_fk` FOREIGN KEY (`users_kyc_id`) REFERENCES `users_kyc`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_aadhaar_user` ON `aadhaar_transactions` (`user_id`);