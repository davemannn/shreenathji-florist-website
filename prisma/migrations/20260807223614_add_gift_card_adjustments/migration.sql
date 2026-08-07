-- CreateTable
CREATE TABLE `GiftCardAdjustment` (
    `id` VARCHAR(191) NOT NULL,
    `giftCardId` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `adjustedByUserId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GiftCardAdjustment_giftCardId_idx`(`giftCardId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GiftCardAdjustment` ADD CONSTRAINT `GiftCardAdjustment_giftCardId_fkey` FOREIGN KEY (`giftCardId`) REFERENCES `GiftCard`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GiftCardAdjustment` ADD CONSTRAINT `GiftCardAdjustment_adjustedByUserId_fkey` FOREIGN KEY (`adjustedByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
