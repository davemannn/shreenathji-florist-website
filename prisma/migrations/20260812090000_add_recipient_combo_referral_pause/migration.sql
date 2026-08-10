-- Category: second nav axis alongside isOccasion
ALTER TABLE `Category`
  ADD COLUMN `isRecipient` BOOLEAN NOT NULL DEFAULT false;

-- Product: lightweight "what's included" text for combo/hamper products
ALTER TABLE `Product`
  ADD COLUMN `comboIncludes` TEXT NULL;

-- SubscriptionStatus: add customer-initiated PAUSED
ALTER TABLE `CustomerSubscription`
  MODIFY COLUMN `status` ENUM('CREATED', 'AUTHENTICATED', 'ACTIVE', 'PENDING', 'HALTED', 'PAUSED', 'CANCELLED', 'COMPLETED', 'EXPIRED') NOT NULL DEFAULT 'CREATED';

-- User: refer-a-friend
ALTER TABLE `User`
  ADD COLUMN `referralCode` VARCHAR(191) NULL,
  ADD COLUMN `referredByUserId` VARCHAR(191) NULL,
  ADD COLUMN `referralRewardGranted` BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX `User_referralCode_key` ON `User`(`referralCode`);

ALTER TABLE `User`
  ADD CONSTRAINT `User_referredByUserId_fkey`
  FOREIGN KEY (`referredByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- StoreSettings: refer-a-friend bonus amount
ALTER TABLE `StoreSettings`
  ADD COLUMN `referralBonusAmount` INTEGER NOT NULL DEFAULT 100;
