ALTER TABLE `users` MODIFY COLUMN `refresh_token_hash` text;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `password_reset_token_hash` text;