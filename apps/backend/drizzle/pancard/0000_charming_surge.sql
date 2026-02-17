CREATE TABLE `pan_sessions` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`pan_number_encrypted` varchar(255) NOT NULL,
	`pan_hash` varchar(64) NOT NULL,
	`masked_pan` varchar(20),
	`idempotency_key` varchar(64) NOT NULL,
	`provider_code` varchar(40) NOT NULL,
	`provider_id` varchar(36) NOT NULL,
	`provider_txn_id` varchar(100),
	`status` varchar(20) NOT NULL DEFAULT 'INITIATED',
	`response_payload` json,
	`failure_reason` varchar(255),
	`verified_at` timestamp,
	`consent_given_at` timestamp,
	`consent_ip` varchar(45),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `pan_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_pan_idempotency` UNIQUE(`tenant_id`,`idempotency_key`)
);
--> statement-breakpoint
CREATE TABLE `pan_callbacks` (
	`id` varchar(36) NOT NULL,
	`session_id` varchar(36) NOT NULL,
	`provider_txn_id` varchar(100) NOT NULL,
	`status` varchar(20) NOT NULL,
	`message` varchar(255),
	`raw_payload` json NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `pan_callbacks_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_pan_callback` UNIQUE(`session_id`,`provider_txn_id`,`status`)
);
--> statement-breakpoint
CREATE TABLE `pan_fee_transactions` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`tenant_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`session_id` varchar(36) NOT NULL,
	`wallet_id` varchar(36) NOT NULL,
	`amount` int NOT NULL,
	`status` varchar(20) NOT NULL,
	`reference` varchar(100),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `pan_fee_transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_pan_fee_session` UNIQUE(`session_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_pan_user` ON `pan_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_pan_hash` ON `pan_sessions` (`pan_hash`);--> statement-breakpoint
CREATE INDEX `idx_pan_callback_session` ON `pan_callbacks` (`session_id`);--> statement-breakpoint
CREATE INDEX `idx_pan_fee_status` ON `pan_fee_transactions` (`status`);