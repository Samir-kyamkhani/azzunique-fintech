CREATE TABLE `audit_log` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
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
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`user_number` varchar(30) NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified_at` timestamp,
	`mobile_number` varchar(20) NOT NULL,
	`profile_picture` varchar(255),
	`password_hash` varchar(255) NOT NULL,
	`transaction_pin_hash` varchar(255),
	`user_status` text NOT NULL DEFAULT ('ACTIVE'),
	`is_kyc_verified` varchar(5) NOT NULL DEFAULT 'false',
	`role_id` varchar(36) NOT NULL,
	`refresh_token_hash` varchar(255),
	`password_reset_token_hash` varchar(255),
	`password_reset_token_expiry` timestamp,
	`action_reason` varchar(500),
	`actioned_at` timestamp,
	`deleted_at` timestamp,
	`parent_id` varchar(36),
	`created_by_employee_id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_user_number_unique` UNIQUE(`user_number`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_mobile_number_unique` UNIQUE(`mobile_number`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`tenant_number` varchar(30) NOT NULL,
	`tenant_name` varchar(255) NOT NULL,
	`tenant_legal_name` varchar(255) NOT NULL,
	`tenant_type` text NOT NULL,
	`user_type` text NOT NULL,
	`tenant_email` varchar(255) NOT NULL,
	`tenant_whatsapp` varchar(20) NOT NULL,
	`parent_tenant_id` varchar(36),
	`created_by_employee_id` varchar(36),
	`tenant_status` text NOT NULL,
	`tenant_mobile_number` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenants_tenant_number_unique` UNIQUE(`tenant_number`),
	CONSTRAINT `tenants_tenant_email_unique` UNIQUE(`tenant_email`),
	CONSTRAINT `tenants_tenant_whatsapp_unique` UNIQUE(`tenant_whatsapp`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`role_code` varchar(50) NOT NULL,
	`role_name` varchar(100) NOT NULL,
	`role_description` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_role_code_unique` UNIQUE(`role_code`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`department_code` varchar(50) NOT NULL,
	`department_name` varchar(100) NOT NULL,
	`department_description` varchar(255),
	`created_by_user_id` varchar(36),
	`created_by_employee_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `departments_id` PRIMARY KEY(`id`),
	CONSTRAINT `departments_department_code_unique` UNIQUE(`department_code`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`employee_number` varchar(30) NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified_at` timestamp,
	`mobile_number` varchar(20) NOT NULL,
	`profile_picture` varchar(255),
	`password_hash` varchar(255) NOT NULL,
	`employee_status` text NOT NULL DEFAULT ('INACTIVE'),
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
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`resource` varchar(100) NOT NULL,
	`action` varchar(50) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`role_id` varchar(36) NOT NULL,
	`permission_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `role_permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_permissions` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`user_id` varchar(36) NOT NULL,
	`permission_id` varchar(36) NOT NULL,
	`effact` text NOT NULL DEFAULT ('ALLOW'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `department_permissions` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`department_id` varchar(36) NOT NULL,
	`permission_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `department_permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employee_permissions` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`employee_id` varchar(36) NOT NULL,
	`permission_id` varchar(36) NOT NULL,
	`effact` text NOT NULL DEFAULT ('ALLOW'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `employee_permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `server_details` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`record_type` varchar(50) NOT NULL,
	`hostname` varchar(255) NOT NULL,
	`value` varchar(45) NOT NULL,
	`status` text NOT NULL DEFAULT ('ACTIVE'),
	`created_by_user_id` varchar(36) NOT NULL,
	`created_by_employee_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `server_details_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenants_domains` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`tenant_id` varchar(36) NOT NULL,
	`domain_name` varchar(255) NOT NULL,
	`status` text NOT NULL,
	`created_by_employee_id` varchar(36),
	`created_by_user_id` varchar(36) NOT NULL,
	`server_detail_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenants_domains_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenants_domains_domain_name_unique` UNIQUE(`domain_name`)
);
--> statement-breakpoint
CREATE TABLE `tenants_websites` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
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
	CONSTRAINT `tenants_websites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenants_social_media` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`tenant_website_id` varchar(36) NOT NULL,
	`facebook_url` varchar(1000),
	`twitter_url` varchar(1000),
	`instagram_url` varchar(1000),
	`linkedin_url` varchar(1000),
	`youtube_url` varchar(1000),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenants_social_media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenants_pages` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`tenant_id` varchar(36) NOT NULL,
	`page_title` varchar(255) NOT NULL,
	`page_content` text,
	`page_url` varchar(255) NOT NULL,
	`status` text NOT NULL DEFAULT ('DRAFT'),
	`created_by_user_id` varchar(36) NOT NULL,
	`created_by_employee_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenants_pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenants_pages_page_url_unique` UNIQUE(`page_url`)
);
--> statement-breakpoint
CREATE TABLE `tenants_seo` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`tenant_page_id` varchar(36) NOT NULL,
	`meta_title` varchar(255) NOT NULL,
	`meta_description` varchar(1000),
	`meta_keywords` varchar(500),
	`is_indexed` boolean NOT NULL DEFAULT true,
	`is_followed` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenants_seo_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenants_smtp_config` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
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
	CONSTRAINT `tenants_smtp_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenants_bank_detail` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`bank_name` varchar(255) NOT NULL,
	`account_holder_name` varchar(255) NOT NULL,
	`account_number` varchar(255) NOT NULL,
	`ifsc_code` varchar(255) NOT NULL,
	`branch_name` varchar(255) NOT NULL,
	`is_primary` boolean NOT NULL DEFAULT false,
	`bank_proof_document_url` varchar(500) NOT NULL,
	`verification_status` text NOT NULL DEFAULT ('PENDING'),
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
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`tenant_id` varchar(36) NOT NULL,
	`status` text NOT NULL DEFAULT ('PENDING'),
	`submitted_by_user_id` varchar(36),
	`verified_by_user_id` varchar(36),
	`verified_by_employee_id` varchar(36),
	`actioned_at` timestamp,
	`action_reason` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenants_kyc_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users_kyc` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`verification_status` text NOT NULL DEFAULT ('PENDING'),
	`submitted_by_user_id` varchar(36),
	`verified_by_user_id` varchar(36) NOT NULL,
	`verified_by_employee_id` varchar(36),
	`actioned_at` timestamp,
	`action_reason` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_kyc_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kyc_documents` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`owner_type` text NOT NULL,
	`owner_id` varchar(36) NOT NULL,
	`document_type` varchar(255) NOT NULL,
	`document_side` text NOT NULL DEFAULT ('SINGLE'),
	`document_url` varchar(500) NOT NULL,
	`document_number` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kyc_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pii_consent` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`user_id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`purpose` varchar(255) NOT NULL,
	`consent_given` boolean NOT NULL,
	`consent_source` text NOT NULL,
	`consent_version` varchar(50) NOT NULL,
	`consent_at` timestamp NOT NULL,
	`expire_at` timestamp,
	`consent_revoked_at` timestamp,
	`consent_revoked_reason` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pii_consent_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`tenant_id` varchar(36) NOT NULL,
	`platform_service_id` varchar(36) NOT NULL,
	`platform_service_feature_id` varchar(36),
	`reference_id` varchar(40) NOT NULL,
	`provider_reference_id` varchar(40),
	`amount` int NOT NULL DEFAULT 0,
	`status` text NOT NULL DEFAULT ('INITIATED'),
	`failure_reason` varchar(500),
	`idempotency_key` varchar(100) NOT NULL,
	`initiated_by_user_id` varchar(36) NOT NULL,
	`meta_data` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_provider_reference_id_unique` UNIQUE(`provider_reference_id`)
);
--> statement-breakpoint
CREATE TABLE `platform_services` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`code` varchar(40) NOT NULL,
	`name` varchar(100) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `platform_services_id` PRIMARY KEY(`id`),
	CONSTRAINT `platform_services_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `platform_service_features` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`code` varchar(40) NOT NULL,
	`name` varchar(100) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`platform_service_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `platform_service_features_id` PRIMARY KEY(`id`),
	CONSTRAINT `platform_service_features_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `service_providers` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`platform_service_id` varchar(36) NOT NULL,
	`code` varchar(40) NOT NULL,
	`provider_name` varchar(100) NOT NULL,
	`handler` varchar(200) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `service_providers_id` PRIMARY KEY(`id`),
	CONSTRAINT `service_providers_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `service_provider_features` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`service_provider_id` varchar(36) NOT NULL,
	`platform_service_feature_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `service_provider_features_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenant_services` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`tenant_id` varchar(36) NOT NULL,
	`platform_service_id` varchar(36) NOT NULL,
	`is_enabled` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenant_services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenant_service_providers` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
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
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`tenant_id` varchar(36) NOT NULL,
	`owner_type` text NOT NULL,
	`owner_id` varchar(36) NOT NULL,
	`wallet_type` text NOT NULL,
	`balance` int NOT NULL DEFAULT 0,
	`status` text NOT NULL DEFAULT ('ACTIVE'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wallets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ledgers` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`wallet_id` varchar(36) NOT NULL,
	`transaction_id` varchar(36),
	`refund_id` varchar(36),
	`entry_type` text NOT NULL,
	`amount` int NOT NULL DEFAULT 0,
	`balance_after` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ledgers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `refunds` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`transaction_id` varchar(36),
	`tenant_id` varchar(36) NOT NULL,
	`amount` int NOT NULL DEFAULT 0,
	`status` text NOT NULL DEFAULT ('PENDING'),
	`initiated_by_user_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `refunds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commission_earnings` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`user_id` varchar(36) NOT NULL,
	`transaction_id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`platform_service_id` varchar(36) NOT NULL,
	`platform_service_feature_id` varchar(36) NOT NULL,
	`wallet_id` varchar(36) NOT NULL,
	`commission_type` text NOT NULL DEFAULT ('FIXED'),
	`commission_value` int NOT NULL,
	`commission_amount` int NOT NULL,
	`surcharge_type` text NOT NULL DEFAULT ('FIXED'),
	`surcharge_value` int NOT NULL,
	`surcharge_amount` int NOT NULL,
	`gross_amount` int NOT NULL,
	`gst_amount` int NOT NULL,
	`net_amount` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commission_earnings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `role_commission_settings` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`tenant_id` varchar(36) NOT NULL,
	`platform_service_id` varchar(36) NOT NULL,
	`platform_service_feature_id` varchar(36) NOT NULL,
	`role_id` varchar(36) NOT NULL,
	`commission_type` text NOT NULL,
	`commission_value` int NOT NULL,
	`surcharge_type` text NOT NULL,
	`surcharge_value` int NOT NULL,
	`gst_applicable` boolean NOT NULL DEFAULT false,
	`gst_rate` int NOT NULL DEFAULT 18,
	`gst_on` text NOT NULL,
	`gst_inclusive` boolean NOT NULL DEFAULT false,
	`max_commission_value` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `role_commission_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_commission_settings` (
	`id` varchar(36) NOT NULL DEFAULT 'UUID()',
	`tenant_id` varchar(36) NOT NULL,
	`platform_service_id` varchar(36) NOT NULL,
	`platform_service_feature_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`commission_type` text NOT NULL,
	`commission_value` int NOT NULL,
	`surcharge_type` text NOT NULL,
	`surcharge_value` int NOT NULL,
	`gst_applicable` boolean NOT NULL DEFAULT false,
	`gst_rate` int NOT NULL DEFAULT 18,
	`gst_on` text NOT NULL,
	`gst_inclusive` boolean NOT NULL DEFAULT false,
	`max_commission_value` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_commission_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_perform_by_user_id_users_id_fk` FOREIGN KEY (`perform_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_parent_id_users_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants` ADD CONSTRAINT `tenants_parent_tenant_id_tenants_id_fk` FOREIGN KEY (`parent_tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `departments` ADD CONSTRAINT `departments_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `departments` ADD CONSTRAINT `departments_created_by_employee_id_users_id_fk` FOREIGN KEY (`created_by_employee_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employees` ADD CONSTRAINT `employees_department_id_departments_id_fk` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employees` ADD CONSTRAINT `employees_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_permissions_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_permissions` ADD CONSTRAINT `user_permissions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_permissions` ADD CONSTRAINT `user_permissions_permission_id_permissions_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `department_permissions` ADD CONSTRAINT `department_permissions_department_id_departments_id_fk` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `department_permissions` ADD CONSTRAINT `department_permissions_permission_id_permissions_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employee_permissions` ADD CONSTRAINT `employee_permissions_employee_id_employees_id_fk` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employee_permissions` ADD CONSTRAINT `employee_permissions_permission_id_permissions_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `server_details` ADD CONSTRAINT `server_details_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_domains` ADD CONSTRAINT `tenants_domains_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_domains` ADD CONSTRAINT `tenants_domains_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_domains` ADD CONSTRAINT `tenants_domains_server_detail_id_server_details_id_fk` FOREIGN KEY (`server_detail_id`) REFERENCES `server_details`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_websites` ADD CONSTRAINT `tenants_websites_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_social_media` ADD CONSTRAINT `tenants_social_media_tenant_website_id_tenants_websites_id_fk` FOREIGN KEY (`tenant_website_id`) REFERENCES `tenants_websites`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_pages` ADD CONSTRAINT `tenants_pages_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_pages` ADD CONSTRAINT `tenants_pages_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_seo` ADD CONSTRAINT `tenants_seo_tenant_page_id_tenants_pages_id_fk` FOREIGN KEY (`tenant_page_id`) REFERENCES `tenants_pages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_smtp_config` ADD CONSTRAINT `tenants_smtp_config_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_smtp_config` ADD CONSTRAINT `tenants_smtp_config_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_bank_detail` ADD CONSTRAINT `tenants_bank_detail_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_bank_detail` ADD CONSTRAINT `tenants_bank_detail_owner_id_users_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_bank_detail` ADD CONSTRAINT `tenants_bank_detail_verified_by_user_id_users_id_fk` FOREIGN KEY (`verified_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_kyc` ADD CONSTRAINT `tenants_kyc_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_kyc` ADD CONSTRAINT `tenants_kyc_submitted_by_user_id_users_id_fk` FOREIGN KEY (`submitted_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants_kyc` ADD CONSTRAINT `tenants_kyc_verified_by_user_id_users_id_fk` FOREIGN KEY (`verified_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users_kyc` ADD CONSTRAINT `users_kyc_submitted_by_user_id_users_id_fk` FOREIGN KEY (`submitted_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users_kyc` ADD CONSTRAINT `users_kyc_verified_by_user_id_users_id_fk` FOREIGN KEY (`verified_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kyc_documents` ADD CONSTRAINT `kyc_documents_owner_id_users_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pii_consent` ADD CONSTRAINT `pii_consent_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pii_consent` ADD CONSTRAINT `pii_consent_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_initiated_by_user_id_users_id_fk` FOREIGN KEY (`initiated_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `platform_service_features` ADD CONSTRAINT `platform_service_features_platform_service_id_platform_services_id_fk` FOREIGN KEY (`platform_service_id`) REFERENCES `platform_services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `service_providers` ADD CONSTRAINT `service_providers_platform_service_id_platform_services_id_fk` FOREIGN KEY (`platform_service_id`) REFERENCES `platform_services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `service_provider_features` ADD CONSTRAINT `service_provider_features_service_provider_id_service_providers_id_fk` FOREIGN KEY (`service_provider_id`) REFERENCES `service_providers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `service_provider_features` ADD CONSTRAINT `service_provider_features_platform_service_feature_id_platform_service_features_id_fk` FOREIGN KEY (`platform_service_feature_id`) REFERENCES `platform_service_features`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenant_services` ADD CONSTRAINT `tenant_services_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenant_services` ADD CONSTRAINT `tenant_services_platform_service_id_platform_services_id_fk` FOREIGN KEY (`platform_service_id`) REFERENCES `platform_services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenant_service_providers` ADD CONSTRAINT `tenant_service_providers_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenant_service_providers` ADD CONSTRAINT `tenant_service_providers_platform_service_id_platform_services_id_fk` FOREIGN KEY (`platform_service_id`) REFERENCES `platform_services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenant_service_providers` ADD CONSTRAINT `tenant_service_providers_service_provider_id_service_providers_id_fk` FOREIGN KEY (`service_provider_id`) REFERENCES `service_providers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wallets` ADD CONSTRAINT `wallets_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ledgers` ADD CONSTRAINT `ledgers_wallet_id_wallets_id_fk` FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ledgers` ADD CONSTRAINT `ledgers_transaction_id_transactions_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ledgers` ADD CONSTRAINT `ledgers_refund_id_refunds_id_fk` FOREIGN KEY (`refund_id`) REFERENCES `refunds`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_transaction_id_transactions_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_initiated_by_user_id_users_id_fk` FOREIGN KEY (`initiated_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_earnings` ADD CONSTRAINT `commission_earnings_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_earnings` ADD CONSTRAINT `commission_earnings_platform_service_id_platform_services_id_fk` FOREIGN KEY (`platform_service_id`) REFERENCES `platform_services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_earnings` ADD CONSTRAINT `commission_earnings_platform_service_feature_id_platform_service_features_id_fk` FOREIGN KEY (`platform_service_feature_id`) REFERENCES `platform_service_features`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_earnings` ADD CONSTRAINT `commission_earnings_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_earnings` ADD CONSTRAINT `commission_earnings_transaction_id_transactions_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_earnings` ADD CONSTRAINT `commission_earnings_wallet_id_wallets_id_fk` FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_commission_settings` ADD CONSTRAINT `role_commission_settings_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_commission_settings` ADD CONSTRAINT `role_commission_settings_platform_service_id_platform_services_id_fk` FOREIGN KEY (`platform_service_id`) REFERENCES `platform_services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_commission_settings` ADD CONSTRAINT `role_commission_settings_platform_service_feature_id_platform_service_features_id_fk` FOREIGN KEY (`platform_service_feature_id`) REFERENCES `platform_service_features`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_commission_settings` ADD CONSTRAINT `role_commission_settings_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_commission_settings` ADD CONSTRAINT `user_commission_settings_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_commission_settings` ADD CONSTRAINT `user_commission_settings_platform_service_id_platform_services_id_fk` FOREIGN KEY (`platform_service_id`) REFERENCES `platform_services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_commission_settings` ADD CONSTRAINT `user_commission_settings_platform_service_feature_id_platform_service_features_id_fk` FOREIGN KEY (`platform_service_feature_id`) REFERENCES `platform_service_features`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_commission_settings` ADD CONSTRAINT `user_commission_settings_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;