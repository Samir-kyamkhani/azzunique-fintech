ALTER TABLE `recharge_operator_map` DROP INDEX `uq_rom_int_ps_prov`;--> statement-breakpoint
ALTER TABLE `recharge_operator_map` ADD `service_provider_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `recharge_transactions` ADD `provider_response` json NOT NULL;--> statement-breakpoint
ALTER TABLE `recharge_operator_map` ADD CONSTRAINT `uq_rom_int_ps_prov` UNIQUE(`internal_operator_code`,`platform_service_id`,`service_provider_id`);--> statement-breakpoint
ALTER TABLE `recharge_operator_map` DROP COLUMN `provider_code`;