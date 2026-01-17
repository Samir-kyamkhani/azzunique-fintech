CREATE TABLE `recharge_operator_map` (
	`id` varchar(36) NOT NULL,
	`platform_service_id` varchar(36) NOT NULL,
	`internal_operator_code` varchar(20) NOT NULL,
	`mplan_operator_code` varchar(10),
	`recharge_exchange_operator_code` varchar(10),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `recharge_operator_map_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recharge_transactions` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`mobile_number` varchar(15) NOT NULL,
	`operator_code` varchar(10) NOT NULL,
	`circle_code` varchar(10),
	`amount` int NOT NULL,
	`platform_service_id` varchar(36) NOT NULL,
	`platform_service_feature_id` varchar(36) NOT NULL,
	`provider_code` varchar(40) NOT NULL,
	`status` varchar(20) NOT NULL,
	`provider_txn_id` varchar(100),
	`reference_id` varchar(100),
	`failure_reason` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `recharge_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recharge_callbacks` (
	`id` varchar(36) NOT NULL,
	`transaction_id` varchar(36) NOT NULL,
	`status` varchar(20) NOT NULL,
	`provider_txn_id` varchar(100),
	`message` varchar(255),
	`raw_payload` json NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `recharge_callbacks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recharge_circle_map` (
	`id` varchar(36) NOT NULL,
	`internal_circle_code` varchar(20) NOT NULL,
	`mplan_circle_code` varchar(10),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `recharge_circle_map_id` PRIMARY KEY(`id`)
);
