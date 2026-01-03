ALTER TABLE `tenants` DROP INDEX `uniq_tenant_email`;--> statement-breakpoint
ALTER TABLE `server_details` ADD `tenant_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `tenants` ADD CONSTRAINT `uniq_tenant_whatsapp` UNIQUE(`parent_tenant_id`,`tenant_whatsapp`);--> statement-breakpoint
ALTER TABLE `tenants` ADD CONSTRAINT `uniq_tenant_mobile_number` UNIQUE(`parent_tenant_id`,`tenant_mobile_number`);--> statement-breakpoint
ALTER TABLE `tenants` ADD CONSTRAINT `uniq_tenant_email` UNIQUE(`parent_tenant_id`,`tenant_email`);--> statement-breakpoint
ALTER TABLE `server_details` ADD CONSTRAINT `server_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;