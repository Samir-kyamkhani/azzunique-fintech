CREATE TABLE `aadhaar_sessions` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`aadhaar_number_encrypted` varchar(255) NOT NULL,
	`masked_aadhaar` varchar(20),
	`idempotency_key` varchar(64) NOT NULL,
	`platform_service_id` varchar(36) NOT NULL,
	`provider_code` varchar(40) NOT NULL,
	`provider_id` varchar(36) NOT NULL,
	`provider_config` json NOT NULL,
	`reference_id` varchar(100),
	`provider_txn_id` varchar(100),
	`status` varchar(20) NOT NULL DEFAULT 'INITIATED',
	`response_payload` json,
	`failure_reason` varchar(255),
	`attempt_count` int DEFAULT 0,
	`last_attempt_at` timestamp,
	`verified_at` timestamp,
	`consent_given_at` timestamp,
	`consent_ip` varchar(45),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `aadhaar_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_aadhaar_idempotency` UNIQUE(`tenant_id`,`idempotency_key`)
);
--> statement-breakpoint
CREATE TABLE `aadhaar_callbacks` (
	`id` varchar(36) NOT NULL,
	`session_id` varchar(36) NOT NULL,
	`provider_txn_id` varchar(100) NOT NULL,
	`status` varchar(20) NOT NULL,
	`message` varchar(255),
	`raw_payload` json NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `aadhaar_callbacks_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_aadhaar_callback` UNIQUE(`session_id`,`provider_txn_id`,`status`)
);
--> statement-breakpoint
CREATE TABLE `aadhaar_fee_transactions` (
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
	CONSTRAINT `aadhaar_fee_transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_aadhaar_fee_session` UNIQUE(`session_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_aadhaar_user` ON `aadhaar_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_aadhaar_status` ON `aadhaar_sessions` (`status`);--> statement-breakpoint
CREATE INDEX `idx_aadhaar_callback_session` ON `aadhaar_callbacks` (`session_id`);--> statement-breakpoint
CREATE INDEX `idx_aadhaar_fee_status` ON `aadhaar_fee_transactions` (`status`);