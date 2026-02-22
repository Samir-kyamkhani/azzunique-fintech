ALTER TABLE `aadhaar_transactions` MODIFY COLUMN `users_kyc_id` varchar(36);--> statement-breakpoint
ALTER TABLE `aadhaar_transactions` ADD `provider_config` json;