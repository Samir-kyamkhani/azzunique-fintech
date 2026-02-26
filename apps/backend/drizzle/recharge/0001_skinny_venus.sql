ALTER TABLE `recharge_operator_map` DROP INDEX `uq_rom_int_ps_prov`;--> statement-breakpoint
ALTER TABLE `recharge_operator_map` ADD `platform_service_feature_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `recharge_operator_map` ADD CONSTRAINT `uq_rom_int_ps_feat_prov` UNIQUE(`internal_operator_code`,`platform_service_id`,`platform_service_feature_id`,`service_provider_id`);