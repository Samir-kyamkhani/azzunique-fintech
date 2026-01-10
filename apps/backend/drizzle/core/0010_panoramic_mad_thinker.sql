CREATE TABLE `role_hierarchy` (
	`parent_role_id` varchar(36) NOT NULL,
	`child_role_id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	CONSTRAINT `uniq_role_hierarchy` UNIQUE(`parent_role_id`,`child_role_id`,`tenant_id`)
);
