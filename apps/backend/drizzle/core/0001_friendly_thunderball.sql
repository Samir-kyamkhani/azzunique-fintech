CREATE TABLE `platform_service_providers` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`platform_service_id` varchar(36) NOT NULL,
	`service_provider_id` varchar(36) NOT NULL,
	`config` json NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `platform_service_providers_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_platform_service_provider` UNIQUE(`platform_service_id`)
);
--> statement-breakpoint
DROP TABLE `tenant_service_providers`;--> statement-breakpoint
ALTER TABLE `platform_service_providers` ADD CONSTRAINT `psp_platform_service_fk` FOREIGN KEY (`platform_service_id`) REFERENCES `platform_services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `platform_service_providers` ADD CONSTRAINT `psp_service_provider_fk` FOREIGN KEY (`service_provider_id`) REFERENCES `service_providers`(`id`) ON DELETE no action ON UPDATE no action;