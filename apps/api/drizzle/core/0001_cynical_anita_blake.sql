ALTER TABLE `users` DROP INDEX `uniq_user_email`;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `uniq_user_email` UNIQUE(`tenant_id`,`email`);