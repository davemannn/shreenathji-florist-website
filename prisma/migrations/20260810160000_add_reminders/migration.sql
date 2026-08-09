-- Customer-saved birthday/anniversary reminders ("My Reminders" on the
-- account page) — recurs yearly, only month+day are meaningful, no year
-- stored. Actual sending is an external cron job hitting
-- /api/cron/send-reminders, not built into this table.

CREATE TABLE `Reminder` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `occasion` ENUM('BIRTHDAY', 'ANNIVERSARY', 'OTHER') NOT NULL,
  `recipientName` VARCHAR(191) NOT NULL,
  `month` INTEGER NOT NULL,
  `day` INTEGER NOT NULL,
  `note` VARCHAR(191) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4;

CREATE INDEX `Reminder_userId_idx` ON `Reminder`(`userId`);
CREATE INDEX `Reminder_month_day_idx` ON `Reminder`(`month`, `day`);

ALTER TABLE `Reminder` ADD CONSTRAINT `Reminder_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
