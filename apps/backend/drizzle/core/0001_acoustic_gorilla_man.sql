CREATE TABLE `mail_queue` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`tenant_id` varchar(36) NOT NULL,
	`recipient_email` varchar(255) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`html` text NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'PENDING',
	`attempts` int NOT NULL DEFAULT 0,
	`next_attempt_at` timestamp NOT NULL DEFAULT (now()),
	`error_message` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mail_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `mail_queue` ADD CONSTRAINT `mail_queue_tenant_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_mail_status_retry` ON `mail_queue` (`status`,`next_attempt_at`);