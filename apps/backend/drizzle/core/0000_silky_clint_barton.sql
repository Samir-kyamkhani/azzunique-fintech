CREATE TABLE `audit_log` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`entity_type` varchar(100) NOT NULL,
	`entity_id` varchar(36) NOT NULL,
	`action` varchar(100) NOT NULL,
	`old_data` json,
	`new_data` json,
	`perform_by_user_id` varchar(36) NOT NULL,
	`perform_by_employee_id` varchar(36),
	`ip_address` varchar(45),
	`user_agent` varchar(500),
	`tenant_id` varchar(36) NOT NULL,
	`meta_data` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`user_number` varchar(30) NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified_at` timestamp,
	`mobile_number` varchar(20) NOT NULL,
	`profile_picture` varchar(255),
	`password_hash` varchar(255) NOT NULL,
	`transaction_pin_hash` varchar(255),
	`user_status` varchar(20) NOT NULL DEFAULT 'INACTIVE',
	`is_kyc_verified` boolean NOT NULL DEFAULT false,
	`role_id` varchar(36) NOT NULL,
	`refresh_token_hash` text,
	`password_reset_token_hash` text,
	`password_reset_token_expiry` timestamp,
	`action_reason` varchar(500),
	`actioned_at` timestamp,
	`deleted_at` timestamp,
	`owner_user_id` varchar(36),
	`created_by_user_id` varchar(36),
	`created_by_employee_id` varchar(36),
	`tenant_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_user_number` UNIQUE(`user_number`),
	CONSTRAINT `uniq_user_email` UNIQUE(`tenant_id`,`email`),
	CONSTRAINT `uniq_user_mobile` UNIQUE(`tenant_id`,`mobile_number`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`tenant_number` varchar(30) NOT NULL,
	`tenant_name` varchar(255) NOT NULL,
	`tenant_legal_name` varchar(255) NOT NULL,
	`tenant_type` varchar(30) NOT NULL,
	`user_type` varchar(20) NOT NULL,
	`tenant_email` varchar(255) NOT NULL,
	`tenant_whatsapp` varchar(20) NOT NULL,
	`parent_tenant_id` varchar(36),
	`created_by_user_id` varchar(36),
	`created_by_employee_id` varchar(36),
	`tenant_status` varchar(20) NOT NULL,
	`tenant_mobile_number` varchar(20) NOT NULL,
	`action_reason` varchar(255),
	`actioned_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_tenant_number` UNIQUE(`tenant_number`),
	CONSTRAINT `uniq_tenant_whatsapp` UNIQUE(`parent_tenant_id`,`tenant_whatsapp`),
	CONSTRAINT `uniq_tenant_mobile_number` UNIQUE(`parent_tenant_id`,`tenant_mobile_number`),
	CONSTRAINT `uniq_tenant_email` UNIQUE(`parent_tenant_id`,`tenant_email`),
	CONSTRAINT `chk_tenants_user_type` CHECK(`tenants`.`user_type` IN ('AZZUNIQUE','RESELLER','WHITELABEL'))
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`role_level` int NOT NULL,
	`role_code` varchar(50) NOT NULL,
	`role_name` varchar(100) NOT NULL,
	`role_description` varchar(255),
	`tenant_id` varchar(36) NOT NULL,
	`is_system` boolean NOT NULL DEFAULT false,
	`created_by_user_id` varchar(36),
	`created_by_employee_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_role_code_tenant` UNIQUE(`tenant_id`,`role_code`),
	CONSTRAINT `uniq_role_level_tenant` UNIQUE(`tenant_id`,`role_level`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`department_code` varchar(50) NOT NULL,
	`department_name` varchar(100) NOT NULL,
	`department_description` varchar(255),
	`tenant_id` varchar(36) NOT NULL,
	`created_by_user_id` varchar(36),
	`created_by_employee_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `departments_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_dept_code_tenant` UNIQUE(`department_code`,`tenant_id`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`employee_number` varchar(30) NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified_at` timestamp,
	`mobile_number` varchar(20) NOT NULL,
	`profile_picture` varchar(255),
	`password_hash` varchar(255) NOT NULL,
	`employee_status` varchar(20) NOT NULL DEFAULT 'INACTIVE',
	`department_id` varchar(36) NOT NULL,
	`refresh_token_hash` varchar(255),
	`password_reset_token_hash` varchar(255),
	`password_reset_token_expiry` timestamp,
	`action_reason` varchar(500),
	`actioned_at` timestamp,
	`tenant_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `employees_id` PRIMARY KEY(`id`),
	CONSTRAINT `employees_employee_number_unique` UNIQUE(`employee_number`),
	CONSTRAINT `employees_email_unique` UNIQUE(`email`),
	CONSTRAINT `employees_mobile_number_unique` UNIQUE(`mobile_number`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`resource` varchar(100) NOT NULL,
	`action` varchar(50) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_permission_resource_action` UNIQUE(`resource`,`action`)
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`role_id` varchar(36) NOT NULL,
	`permission_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `role_permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_role_permission` UNIQUE(`role_id`,`permission_id`)
);
--> statement-breakpoint
CREATE TABLE `user_permissions` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`user_id` varchar(36) NOT NULL,
	`permission_id` varchar(36) NOT NULL,
	`effect` varchar(20) NOT NULL DEFAULT 'ALLOW',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_user_permission` UNIQUE(`user_id`,`permission_id`)
);
--> statement-breakpoint
CREATE TABLE `department_permissions` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`department_id` varchar(36) NOT NULL,
	`permission_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `department_permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_department_permission` UNIQUE(`department_id`,`permission_id`)
);
--> statement-breakpoint
CREATE TABLE `employee_permissions` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`employee_id` varchar(36) NOT NULL,
	`permission_id` varchar(36) NOT NULL,
	`effect` varchar(10) NOT NULL DEFAULT 'ALLOW',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `employee_permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_employee_permission` UNIQUE(`employee_id`,`permission_id`)
);
--> statement-breakpoint
CREATE TABLE `server_details` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`tenant_id` varchar(36) NOT NULL,
	`record_type` varchar(50) NOT NULL,
	`hostname` varchar(255) NOT NULL,
	`value` varchar(255) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
	`created_by_user_id` varchar(36),
	`created_by_employee_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `server_details_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenants_domains` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`tenant_id` varchar(36) NOT NULL,
	`domain_name` varchar(255) NOT NULL,
	`status` varchar(20) NOT NULL,
	`action_reason` varchar(255),
	`actioned_at` timestamp,
	`created_by_employee_id` varchar(36),
	`created_by_user_id` varchar(36) NOT NULL,
	`server_detail_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenants_domains_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_tenant_domain` UNIQUE(`domain_name`)
);
--> statement-breakpoint
CREATE TABLE `tenants_websites` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`tenant_id` varchar(36) NOT NULL,
	`brand_name` varchar(255) NOT NULL,
	`tag_line` varchar(500),
	`logo_url` varchar(1000),
	`fav_icon_url` varchar(1000),
	`primary_color` varchar(7),
	`secondary_color` varchar(7),
	`support_email` varchar(255),
	`support_phone` varchar(20),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenants_websites_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_tenant_website` UNIQUE(`tenant_id`)
);
--> statement-breakpoint
CREATE TABLE `tenants_social_media` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`tenant_website_id` varchar(36) NOT NULL,
	`facebook_url` varchar(1000),
	`twitter_url` varchar(1000),
	`instagram_url` varchar(1000),
	`linkedin_url` varchar(1000),
	`youtube_url` varchar(1000),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenants_social_media_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_tenant_website_social` UNIQUE(`tenant_website_id`)
);
--> statement-breakpoint
CREATE TABLE `tenants_pages` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`tenant_id` varchar(36) NOT NULL,
	`page_title` varchar(255) NOT NULL,
	`page_content` text,
	`page_url` varchar(255) NOT NULL,
	`page_type` varchar(30) NOT NULL,
	`is_home_page` boolean NOT NULL DEFAULT false,
	`status` varchar(20) NOT NULL DEFAULT 'DRAFT',
	`created_by_user_id` varchar(36) NOT NULL,
	`created_by_employee_id` varchar(36),
	`source_master_page_id` varchar(36),
	`deleted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenants_pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_tenant_page_url` UNIQUE(`tenant_id`,`page_url`)
);
--> statement-breakpoint
CREATE TABLE `tenants_seo` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`tenant_page_id` varchar(36) NOT NULL,
	`meta_title` varchar(255) NOT NULL,
	`meta_description` varchar(1000),
	`meta_keywords` varchar(500),
	`is_indexed` boolean NOT NULL DEFAULT true,
	`is_followed` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenants_seo_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_tenant_page_seo` UNIQUE(`tenant_page_id`)
);
--> statement-breakpoint
CREATE TABLE `tenants_smtp_config` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`smtp_host` varchar(255) NOT NULL,
	`smtp_port` varchar(10) NOT NULL,
	`smtp_username` varchar(255) NOT NULL,
	`smtp_password` varchar(255) NOT NULL,
	`encryption_type` varchar(50),
	`from_name` varchar(255) NOT NULL,
	`from_email` varchar(255) NOT NULL,
	`created_by_user_id` varchar(36) NOT NULL,
	`created_by_employee_id` varchar(36),
	`tenant_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenants_smtp_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_tenant_smtp_config` UNIQUE(`tenant_id`)
);
--> statement-breakpoint
CREATE TABLE `tenants_bank_detail` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`bank_name` varchar(255) NOT NULL,
	`account_holder_name` varchar(255) NOT NULL,
	`account_number` varchar(255) NOT NULL,
	`ifsc_code` varchar(255) NOT NULL,
	`branch_name` varchar(255) NOT NULL,
	`is_primary` boolean NOT NULL DEFAULT false,
	`bank_proof_document_url` varchar(500) NOT NULL,
	`verification_status` varchar(20) NOT NULL DEFAULT 'PENDING',
	`owner_id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`submitted_by_employee_id` varchar(36),
	`verified_by_user_id` varchar(36) NOT NULL,
	`verified_by_employee_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenants_bank_detail_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenants_kyc` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`tenant_id` varchar(36) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'PENDING',
	`submitted_by_user_id` varchar(36),
	`verified_by_user_id` varchar(36),
	`verified_by_employee_id` varchar(36),
	`actioned_at` timestamp,
	`action_reason` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenants_kyc_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_tenant_kyc` UNIQUE(`tenant_id`)
);
--> statement-breakpoint
CREATE TABLE `users_kyc` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`user_id` varchar(36) NOT NULL,
	`verification_status` varchar(20) NOT NULL DEFAULT 'PENDING',
	`submitted_by_user_id` varchar(36),
	`verified_by_user_id` varchar(36),
	`verified_by_employee_id` varchar(36),
	`actioned_at` timestamp,
	`action_reason` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_kyc_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_user_kyc` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `kyc_documents` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`owner_type` varchar(10) NOT NULL,
	`owner_id` varchar(36) NOT NULL,
	`document_type` varchar(255) NOT NULL,
	`document_side` varchar(10) NOT NULL DEFAULT 'SINGLE',
	`document_url` varchar(500) NOT NULL,
	`document_number` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kyc_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pii_consent` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`user_id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`purpose` varchar(255) NOT NULL,
	`consent_given` boolean NOT NULL,
	`consent_source` varchar(10) NOT NULL,
	`consent_version` varchar(50) NOT NULL,
	`consent_at` timestamp NOT NULL,
	`expire_at` timestamp,
	`consent_revoked_at` timestamp,
	`consent_revoked_reason` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pii_consent_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_pii_consent` UNIQUE(`user_id`,`tenant_id`,`purpose`,`consent_version`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`tenant_id` varchar(36) NOT NULL,
	`platform_service_id` varchar(36) NOT NULL,
	`platform_service_feature_id` varchar(36),
	`reference_id` varchar(40) NOT NULL,
	`provider_reference_id` varchar(40),
	`amount` int NOT NULL DEFAULT 0,
	`status` varchar(20) NOT NULL DEFAULT 'INITIATED',
	`failure_reason` varchar(500),
	`idempotency_key` varchar(100) NOT NULL,
	`initiated_by_user_id` varchar(36) NOT NULL,
	`meta_data` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_provider_reference_id_unique` UNIQUE(`provider_reference_id`),
	CONSTRAINT `uniq_txn_tenant_idempotency` UNIQUE(`tenant_id`,`idempotency_key`)
);
--> statement-breakpoint
CREATE TABLE `platform_services` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`code` varchar(40) NOT NULL,
	`name` varchar(100) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `platform_services_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_platform_service_code` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `platform_service_features` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`code` varchar(40) NOT NULL,
	`name` varchar(100) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`platform_service_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `platform_service_features_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_platform_service_feature` UNIQUE(`platform_service_id`,`code`)
);
--> statement-breakpoint
CREATE TABLE `service_providers` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`platform_service_id` varchar(36) NOT NULL,
	`code` varchar(40) NOT NULL,
	`provider_name` varchar(100) NOT NULL,
	`handler` varchar(200) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `service_providers_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_service_provider` UNIQUE(`platform_service_id`,`code`)
);
--> statement-breakpoint
CREATE TABLE `service_provider_features` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`service_provider_id` varchar(36) NOT NULL,
	`platform_service_feature_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `service_provider_features_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_service_provider_feature` UNIQUE(`service_provider_id`,`platform_service_feature_id`)
);
--> statement-breakpoint
CREATE TABLE `tenant_services` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`tenant_id` varchar(36) NOT NULL,
	`platform_service_id` varchar(36) NOT NULL,
	`is_enabled` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenant_services_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_tenant_service` UNIQUE(`tenant_id`,`platform_service_id`)
);
--> statement-breakpoint
CREATE TABLE `tenant_service_providers` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`tenant_id` varchar(36) NOT NULL,
	`platform_service_id` varchar(36) NOT NULL,
	`service_provider_id` varchar(36) NOT NULL,
	`config` json NOT NULL,
	`is_enabled` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenant_service_providers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`tenant_id` varchar(36) NOT NULL,
	`owner_type` varchar(10) NOT NULL,
	`owner_id` varchar(36) NOT NULL,
	`wallet_type` varchar(20) NOT NULL,
	`balance` int NOT NULL DEFAULT 0,
	`blocked_amount` int NOT NULL DEFAULT 0,
	`status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_wallet_identity` UNIQUE(`tenant_id`,`owner_type`,`owner_id`,`wallet_type`)
);
--> statement-breakpoint
CREATE TABLE `ledgers` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`wallet_id` varchar(36) NOT NULL,
	`transaction_id` varchar(36),
	`refund_id` varchar(36),
	`entry_type` varchar(10) NOT NULL,
	`amount` int NOT NULL DEFAULT 0,
	`balance_after` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ledgers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `refunds` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`transaction_id` varchar(36),
	`tenant_id` varchar(36) NOT NULL,
	`amount` int NOT NULL DEFAULT 0,
	`status` varchar(20) NOT NULL DEFAULT 'PENDING',
	`initiated_by_user_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `refunds_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_refund_transaction` UNIQUE(`transaction_id`)
);
--> statement-breakpoint
CREATE TABLE `commission_earnings` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`user_id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`wallet_id` varchar(36) NOT NULL,
	`transaction_id` varchar(36) NOT NULL,
	`platform_service_id` varchar(36) NOT NULL,
	`platform_service_feature_id` varchar(36) NOT NULL,
	`commission_type` varchar(20) NOT NULL,
	`commission_value` int NOT NULL,
	`commission_amount` int NOT NULL,
	`surcharge_type` varchar(20) NOT NULL,
	`surcharge_value` int NOT NULL,
	`surcharge_amount` int NOT NULL,
	`gross_amount` int NOT NULL,
	`gst_amount` int NOT NULL,
	`net_amount` int NOT NULL,
	`final_amount` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commission_earnings_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_commission_earning` UNIQUE(`transaction_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `role_commission_settings` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`tenant_id` varchar(36) NOT NULL,
	`platform_service_id` varchar(36) NOT NULL,
	`platform_service_feature_id` varchar(36) NOT NULL,
	`role_id` varchar(36) NOT NULL,
	`commission_type` varchar(20) NOT NULL,
	`commission_value` int NOT NULL,
	`surcharge_type` varchar(20) NOT NULL,
	`surcharge_value` int NOT NULL,
	`gst_applicable` boolean NOT NULL DEFAULT false,
	`gst_rate` int NOT NULL DEFAULT 18,
	`gst_on` varchar(20) NOT NULL,
	`gst_inclusive` boolean NOT NULL DEFAULT false,
	`max_commission_value` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `role_commission_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_role_commission_rule` UNIQUE(`tenant_id`,`role_id`,`platform_service_feature_id`)
);
--> statement-breakpoint
CREATE TABLE `user_commission_settings` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`tenant_id` varchar(36) NOT NULL,
	`platform_service_id` varchar(36) NOT NULL,
	`platform_service_feature_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`commission_type` varchar(20) NOT NULL,
	`commission_value` int NOT NULL,
	`surcharge_type` varchar(20) NOT NULL,
	`surcharge_value` int NOT NULL,
	`gst_applicable` boolean NOT NULL DEFAULT false,
	`gst_rate` int NOT NULL DEFAULT 18,
	`gst_on` varchar(20) NOT NULL,
	`gst_inclusive` boolean NOT NULL DEFAULT false,
	`max_commission_value` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_commission_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_user_commission_setting` UNIQUE(`tenant_id`,`user_id`,`platform_service_feature_id`)
);
--> statement-breakpoint
CREATE TABLE `wallet_snapshots` (
	`id` varchar(36) NOT NULL,
	`wallet_id` varchar(36) NOT NULL,
	`balance` int NOT NULL,
	`blocked_amount` int NOT NULL,
	`snapshot_date` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wallet_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_user_fk` FOREIGN KEY (`perform_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_tenant_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `user_role_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `user_tenant_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `user_owner_fk` FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `user_created_by_user_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants` ADD CONSTRAINT `tenant_parent_fk` FOREIGN KEY (`parent_tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants` ADD CONSTRAINT `tenant_created_by_user_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `roles` ADD CONSTRAINT `role_tenant_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `roles` ADD CONSTRAINT `role_created_by_user_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `roles` ADD CONSTRAINT `role_created_by_employee_fk` FOREIGN KEY (`created_by_employee_id`) REFERENCES `employees`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `departments` ADD CONSTRAINT `dept_created_by_user_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `departments` ADD CONSTRAINT `dept_created_by_employee_fk` FOREIGN KEY (`created_by_employee_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `departments` ADD CONSTRAINT `dept_tenant_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employees` ADD CONSTRAINT `emp_department_fk` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employees` ADD CONSTRAINT `emp_tenant_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `rp_role_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `rp_permission_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_permissions` ADD CONSTRAINT `up_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_permissions` ADD CONSTRAINT `up_permission_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `department_permissions` ADD CONSTRAINT `dp_department_fk` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `department_permissions` ADD CONSTRAINT `dp_permission_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employee_permissions` ADD CONSTRAINT `ep_employee_fk` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employee_permissions` ADD CONSTRAINT `ep_permission_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `server_details` ADD CONSTRAINT `server_created_by_user_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `server_details` ADD CONSTRAINT `server_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_domains` ADD CONSTRAINT `td_tenant_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_domains` ADD CONSTRAINT `td_created_by_user_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_domains` ADD CONSTRAINT `td_server_detail_fk` FOREIGN KEY (`server_detail_id`) REFERENCES `server_details`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_websites` ADD CONSTRAINT `tw_tenant_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_social_media` ADD CONSTRAINT `tsm_website_fk` FOREIGN KEY (`tenant_website_id`) REFERENCES `tenants_websites`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_pages` ADD CONSTRAINT `tp_tenant_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_pages` ADD CONSTRAINT `tp_created_by_user_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_seo` ADD CONSTRAINT `tseo_page_fk` FOREIGN KEY (`tenant_page_id`) REFERENCES `tenants_pages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_smtp_config` ADD CONSTRAINT `smtp_tenant_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_smtp_config` ADD CONSTRAINT `smtp_created_by_user_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_bank_detail` ADD CONSTRAINT `bank_tenant_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_bank_detail` ADD CONSTRAINT `bank_owner_user_fk` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_bank_detail` ADD CONSTRAINT `bank_verified_by_user_fk` FOREIGN KEY (`verified_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_kyc` ADD CONSTRAINT `tk_tenant_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_kyc` ADD CONSTRAINT `tk_submitted_by_user_fk` FOREIGN KEY (`submitted_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_kyc` ADD CONSTRAINT `tk_verified_by_user_fk` FOREIGN KEY (`verified_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users_kyc` ADD CONSTRAINT `uk_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users_kyc` ADD CONSTRAINT `uk_submitted_by_user_fk` FOREIGN KEY (`submitted_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users_kyc` ADD CONSTRAINT `uk_verified_by_user_fk` FOREIGN KEY (`verified_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kyc_documents` ADD CONSTRAINT `kyc_owner_user_fk` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pii_consent` ADD CONSTRAINT `pii_consent_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pii_consent` ADD CONSTRAINT `pii_consent_tenant_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `txn_initiated_by_user_fk` FOREIGN KEY (`initiated_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `txn_tenant_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `platform_service_features` ADD CONSTRAINT `psf_ps_fk` FOREIGN KEY (`platform_service_id`) REFERENCES `platform_services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `service_providers` ADD CONSTRAINT `sp_ps_fk` FOREIGN KEY (`platform_service_id`) REFERENCES `platform_services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `service_provider_features` ADD CONSTRAINT `spf_service_provider_fk` FOREIGN KEY (`service_provider_id`) REFERENCES `service_providers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `service_provider_features` ADD CONSTRAINT `spf_platform_service_feature_fk` FOREIGN KEY (`platform_service_feature_id`) REFERENCES `platform_service_features`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenant_services` ADD CONSTRAINT `ts_tenant_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenant_services` ADD CONSTRAINT `ts_platform_service_fk` FOREIGN KEY (`platform_service_id`) REFERENCES `platform_services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenant_service_providers` ADD CONSTRAINT `tsp_tenant_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenant_service_providers` ADD CONSTRAINT `tsp_platform_service_fk` FOREIGN KEY (`platform_service_id`) REFERENCES `platform_services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenant_service_providers` ADD CONSTRAINT `tsp_service_provider_fk` FOREIGN KEY (`service_provider_id`) REFERENCES `service_providers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wallets` ADD CONSTRAINT `wallets_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ledgers` ADD CONSTRAINT `ledger_wallet_fk` FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ledgers` ADD CONSTRAINT `ledger_transaction_fk` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ledgers` ADD CONSTRAINT `ledger_refund_fk` FOREIGN KEY (`refund_id`) REFERENCES `refunds`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `refunds` ADD CONSTRAINT `refund_tenant_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `refunds` ADD CONSTRAINT `refund_transaction_fk` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `refunds` ADD CONSTRAINT `refund_initiated_by_user_fk` FOREIGN KEY (`initiated_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_earnings` ADD CONSTRAINT `ce_tenant_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_earnings` ADD CONSTRAINT `ce_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_earnings` ADD CONSTRAINT `ce_wallet_fk` FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_earnings` ADD CONSTRAINT `ce_tx_fk` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_earnings` ADD CONSTRAINT `ce_ps_fk` FOREIGN KEY (`platform_service_id`) REFERENCES `platform_services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_earnings` ADD CONSTRAINT `ce_psf_fk` FOREIGN KEY (`platform_service_feature_id`) REFERENCES `platform_service_features`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_commission_settings` ADD CONSTRAINT `rcs_tenant_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_commission_settings` ADD CONSTRAINT `rcs_ps_fk` FOREIGN KEY (`platform_service_id`) REFERENCES `platform_services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_commission_settings` ADD CONSTRAINT `rcs_psf_fk` FOREIGN KEY (`platform_service_feature_id`) REFERENCES `platform_service_features`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_commission_settings` ADD CONSTRAINT `rcs_role_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_commission_settings` ADD CONSTRAINT `ucs_tenant_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_commission_settings` ADD CONSTRAINT `ucs_platform_service_fk` FOREIGN KEY (`platform_service_id`) REFERENCES `platform_services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_commission_settings` ADD CONSTRAINT `ucs_platform_service_feature_fk` FOREIGN KEY (`platform_service_feature_id`) REFERENCES `platform_service_features`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_commission_settings` ADD CONSTRAINT `ucs_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wallet_snapshots` ADD CONSTRAINT `wallet_snapshots_wallet_id_wallets_id_fk` FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_user_tenant_status` ON `users` (`tenant_id`,`user_status`);--> statement-breakpoint
CREATE INDEX `idx_user_owner` ON `users` (`owner_user_id`);--> statement-breakpoint
CREATE INDEX `idx_tenant_parent` ON `tenants` (`parent_tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_tenant_status` ON `tenants` (`tenant_status`);--> statement-breakpoint
CREATE INDEX `idx_role_tenant_level` ON `roles` (`tenant_id`,`role_level`);--> statement-breakpoint
CREATE INDEX `idx_role_tenant` ON `roles` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_emp_tenant_status` ON `employees` (`tenant_id`,`employee_status`);--> statement-breakpoint
CREATE INDEX `idx_emp_department` ON `employees` (`department_id`);--> statement-breakpoint
CREATE INDEX `idx_server_hostname_status` ON `server_details` (`hostname`,`status`);--> statement-breakpoint
CREATE INDEX `idx_tenant_domain_tenant` ON `tenants_domains` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_tenant_domain_status` ON `tenants_domains` (`status`);--> statement-breakpoint
CREATE INDEX `idx_tenant_page_type` ON `tenants_pages` (`page_type`);--> statement-breakpoint
CREATE INDEX `idx_tenant_pages_status` ON `tenants_pages` (`status`);--> statement-breakpoint
CREATE INDEX `idx_tenant_kyc_status` ON `tenants_kyc` (`status`);--> statement-breakpoint
CREATE INDEX `idx_user_kyc_status` ON `users_kyc` (`verification_status`);--> statement-breakpoint
CREATE INDEX `idx_kyc_owner` ON `kyc_documents` (`owner_type`,`owner_id`);--> statement-breakpoint
CREATE INDEX `idx_kyc_document_type` ON `kyc_documents` (`document_type`);--> statement-breakpoint
CREATE INDEX `idx_pii_consent_user` ON `pii_consent` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_pii_consent_tenant` ON `pii_consent` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_psf_service` ON `platform_service_features` (`platform_service_id`);--> statement-breakpoint
CREATE INDEX `idx_psf_active` ON `platform_service_features` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_service_provider_service` ON `service_providers` (`platform_service_id`);--> statement-breakpoint
CREATE INDEX `idx_service_provider_active` ON `service_providers` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_tenant_service_tenant` ON `tenant_services` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_tenant_service_enabled` ON `tenant_services` (`is_enabled`);--> statement-breakpoint
CREATE INDEX `idx_wallet_tenant` ON `wallets` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_ledger_wallet_created` ON `ledgers` (`wallet_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_ledger_transaction` ON `ledgers` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `idx_refund_tenant_status` ON `refunds` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_refund_transaction` ON `refunds` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `idx_commission_tenant` ON `commission_earnings` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_commission_user` ON `commission_earnings` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_commission_transaction` ON `commission_earnings` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `idx_rcs_tenant` ON `role_commission_settings` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_rcs_role` ON `role_commission_settings` (`role_id`);--> statement-breakpoint
CREATE INDEX `idx_rcs_feature` ON `role_commission_settings` (`platform_service_feature_id`);--> statement-breakpoint
CREATE INDEX `idx_wallet_snapshots_wallet` ON `wallet_snapshots` (`wallet_id`);