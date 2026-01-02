ALTER TABLE `users` DROP INDEX `uniq_user_mobile`;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `uniq_user_mobile` UNIQUE(`tenant_id`,`mobile_number`);