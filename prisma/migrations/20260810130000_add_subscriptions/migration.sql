-- Recurring flower subscriptions (daily pooja flowers, weekly bouquet
-- boxes, raw flower deliveries). SubscriptionPlan is the admin-managed
-- catalog entry; SubscriptionPlanInterval is the billable cadence (maps
-- 1:1 to a real Razorpay Plan); CustomerSubscription is an active
-- subscriber (maps 1:1 to a real Razorpay Subscription). Order.subscriptionId
-- traces recurring-charge-created orders back to their subscription.

ALTER TABLE `Order` ADD COLUMN `subscriptionId` VARCHAR(191) NULL;
CREATE INDEX `Order_subscriptionId_idx` ON `Order`(`subscriptionId`);

CREATE TABLE `SubscriptionPlan` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `category` ENUM('DAILY_POOJA', 'WEEKLY_FLOWERS', 'RAW_FLOWERS', 'CUSTOM') NOT NULL DEFAULT 'CUSTOM',
  `imageUrl` VARCHAR(191) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `SubscriptionPlan_isActive_sortOrder_idx` ON `SubscriptionPlan`(`isActive`, `sortOrder`);

CREATE TABLE `SubscriptionPlanInterval` (
  `id` VARCHAR(191) NOT NULL,
  `subscriptionPlanId` VARCHAR(191) NOT NULL,
  `interval` ENUM('WEEKLY', 'MONTHLY', 'ANNUAL') NOT NULL,
  `price` INTEGER NOT NULL,
  `discountPercent` INTEGER NOT NULL DEFAULT 0,
  `razorpayPlanId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `SubscriptionPlanInterval_subscriptionPlanId_interval_key` ON `SubscriptionPlanInterval`(`subscriptionPlanId`, `interval`);

ALTER TABLE `SubscriptionPlanInterval` ADD CONSTRAINT `SubscriptionPlanInterval_subscriptionPlanId_fkey`
  FOREIGN KEY (`subscriptionPlanId`) REFERENCES `SubscriptionPlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `CustomerSubscription` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `subscriptionPlanId` VARCHAR(191) NOT NULL,
  `subscriptionPlanIntervalId` VARCHAR(191) NOT NULL,
  `razorpaySubscriptionId` VARCHAR(191) NOT NULL,
  `status` ENUM('CREATED', 'AUTHENTICATED', 'ACTIVE', 'PENDING', 'HALTED', 'CANCELLED', 'COMPLETED', 'EXPIRED') NOT NULL DEFAULT 'CREATED',
  `recipientName` VARCHAR(191) NOT NULL,
  `recipientPhone` VARCHAR(191) NOT NULL,
  `deliveryLine1` VARCHAR(191) NOT NULL,
  `deliveryLine2` VARCHAR(191) NULL,
  `deliveryCity` VARCHAR(191) NOT NULL,
  `deliveryState` VARCHAR(191) NOT NULL,
  `deliveryPincode` VARCHAR(191) NOT NULL,
  `currentPeriodEnd` DATETIME(3) NULL,
  `cancelledAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `CustomerSubscription_razorpaySubscriptionId_key` ON `CustomerSubscription`(`razorpaySubscriptionId`);
CREATE INDEX `CustomerSubscription_userId_idx` ON `CustomerSubscription`(`userId`);
CREATE INDEX `CustomerSubscription_status_idx` ON `CustomerSubscription`(`status`);

ALTER TABLE `CustomerSubscription` ADD CONSTRAINT `CustomerSubscription_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `CustomerSubscription` ADD CONSTRAINT `CustomerSubscription_subscriptionPlanId_fkey`
  FOREIGN KEY (`subscriptionPlanId`) REFERENCES `SubscriptionPlan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `CustomerSubscription` ADD CONSTRAINT `CustomerSubscription_subscriptionPlanIntervalId_fkey`
  FOREIGN KEY (`subscriptionPlanIntervalId`) REFERENCES `SubscriptionPlanInterval`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Order` ADD CONSTRAINT `Order_subscriptionId_fkey`
  FOREIGN KEY (`subscriptionId`) REFERENCES `CustomerSubscription`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
