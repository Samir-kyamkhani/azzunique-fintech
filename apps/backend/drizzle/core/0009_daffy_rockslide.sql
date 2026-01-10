ALTER TABLE `roles` DROP INDEX `uniq_role_code`;--> statement-breakpoint
ALTER TABLE `roles` ADD `tenant_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `roles` ADD `is_system` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `roles` ADD `created_by_user_id` varchar(36);--> statement-breakpoint
ALTER TABLE `roles` ADD `created_by_employee_id` varchar(36);--> statement-breakpoint
ALTER TABLE `roles` ADD CONSTRAINT `uniq_role_code_tenant` UNIQUE(`tenant_id`,`role_code`);--> statement-breakpoint
ALTER TABLE `roles` ADD CONSTRAINT `role_tenant_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `roles` ADD CONSTRAINT `role_created_by_user_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `roles` ADD CONSTRAINT `role_created_by_employee_fk` FOREIGN KEY (`created_by_employee_id`) REFERENCES `employees`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_role_tenant` ON `roles` (`tenant_id`);