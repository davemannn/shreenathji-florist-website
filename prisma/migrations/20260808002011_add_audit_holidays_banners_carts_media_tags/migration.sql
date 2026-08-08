
-- AlterTable
ALTER TABLE `Category` ADD COLUMN `isArchived` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `StoreSettings` ADD COLUMN `codEnabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `razorpayEnabled` BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `entityLabel` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `summary` VARCHAR(191) NOT NULL,
    `changedByUserId` VARCHAR(191) NOT NULL,
    `changedByName` VARCHAR(191) NOT NULL,
    `changedByRole` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Holiday` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `blocksAllDelivery` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Holiday_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Banner` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('HERO', 'PROMO', 'OCCASION') NOT NULL,
    `eyebrow` VARCHAR(191) NULL,
    `headline` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NULL,
    `ctaLabel` VARCHAR(191) NULL,
    `ctaHref` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `imageAlt` VARCHAR(191) NULL,
    `imageCloudinaryId` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CartSnapshot` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `items` JSON NOT NULL,
    `itemCount` INTEGER NOT NULL DEFAULT 0,
    `subtotal` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,
    `reminderSentAt` DATETIME(3) NULL,

    UNIQUE INDEX `CartSnapshot_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomerTag` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CustomerTag_userId_idx`(`userId`),
    UNIQUE INDEX `CustomerTag_userId_label_key`(`userId`, `label`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaAsset` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `cloudinaryId` VARCHAR(191) NOT NULL,
    `alt` VARCHAR(191) NULL,
    `folder` VARCHAR(191) NOT NULL,
    `uploadedByUserId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MediaAsset_folder_idx`(`folder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CartSnapshot` ADD CONSTRAINT `CartSnapshot_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerTag` ADD CONSTRAINT `CustomerTag_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

