ALTER TABLE `users` DROP FOREIGN KEY `user_parent_fk`;
--> statement-breakpoint
DROP INDEX `idx_user_parent` ON `users`;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `password_reset_token_expiry` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `owner_user_id` varchar(36);--> statement-breakpoint
ALTER TABLE `users` ADD `created_by_user_id` varchar(36);--> statement-breakpoint
ALTER TABLE `tenants` ADD `created_by_user_id` varchar(36);--> statement-breakpoint
ALTER TABLE `tenants` ADD CONSTRAINT `chk_tenants_user_type` CHECK (`tenants`.`user_type` IN ('AZZUNIQUE','RESELLER','WHITELABEL'));--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `user_owner_fk` FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `user_created_by_user_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants` ADD CONSTRAINT `tenant_created_by_user_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_user_owner` ON `users` (`owner_user_id`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `parent_id`;