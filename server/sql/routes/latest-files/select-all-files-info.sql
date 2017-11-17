SELECT `id`, `file_name` AS `name`, `relative_path` AS `path`, `sha256`, `direct_download` AS `link`, UNIX_TIMESTAMP(last_changed)*1000 AS `last_changed`
FROM `latest_files`;