DROP TABLE `role_hierarchy`;--> statement-breakpoint
ALTER TABLE `roles` ADD `role_level` int NOT NULL;--> statement-breakpoint
ALTER TABLE `roles` ADD CONSTRAINT `uniq_role_level_tenant` UNIQUE(`tenant_id`,`role_level`);--> statement-breakpoint
CREATE INDEX `idx_role_tenant_level` ON `roles` (`tenant_id`,`role_level`);