-- Create system_backlog table
CREATE TABLE IF NOT EXISTS `system_backlog` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `task_title` VARCHAR(255) NOT NULL,
  `task_description` TEXT,
  `category` VARCHAR(100) NOT NULL,
  `priority` ENUM('High', 'Medium', 'Low') NOT NULL DEFAULT 'Medium',
  `status` ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `due_date` DATE DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_priority` (`priority`),
  INDEX `idx_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
INSERT INTO `system_backlog` (`task_title`, `task_description`, `category`, `priority`, `status`, `due_date`) VALUES
('Fix login authentication bug', 'Users are experiencing timeout issues during login. Need to investigate session management.', 'Bug Fix', 'High', 'Pending', '2024-02-15'),
('Implement dark mode toggle', 'Add a theme switcher to allow users to toggle between light and dark modes.', 'Feature', 'Medium', 'In Progress', '2024-02-20'),
('Update API documentation', 'Document all new endpoints added in v2.0 release.', 'Documentation', 'Low', 'Pending', '2024-02-25'),
('Optimize database queries', 'Improve performance of shipment tracking queries.', 'Development', 'High', 'Pending', '2024-02-18');
