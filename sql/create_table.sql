USE `dietstory`;

CREATE TABLE `latest_files` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`file_name` VARCHAR(255) NOT NULL,
	`relative_path` VARCHAR(255) NOT NULL,
	`sha256` VARCHAR(64) NOT NULL,
	`direct_download` VARCHAR(2083) NOT NULL,
	`last_changed` DATETIME NOT NULL,
	PRIMARY KEY (`id`),
	UNIQUE KEY `latest_files_key` (`id`, `file_name`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;