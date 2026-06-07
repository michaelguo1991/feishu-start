CREATE TABLE `profile_versions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`feishu_open_id` text NOT NULL,
	`version` integer NOT NULL,
	`display_name` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`department` text DEFAULT '' NOT NULL,
	`bio` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_versions_user_version_idx` ON `profile_versions` (`feishu_open_id`,`version`);