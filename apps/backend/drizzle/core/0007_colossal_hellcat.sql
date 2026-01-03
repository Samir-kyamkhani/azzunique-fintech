ALTER TABLE `tenants` DROP INDEX `uniq_tenant_mobile_number`;--> statement-breakpoint
ALTER TABLE `server_details` DROP FOREIGN KEY `server_tenant_id_fk`;
--> statement-breakpoint
ALTER TABLE `server_details` DROP COLUMN `tenant_id`;