-- AlterTable
ALTER TABLE `Order` ADD COLUMN `assignedDeliveryPersonId` VARCHAR(191) NULL,
    ADD COLUMN `deliveredAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `phone` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `OrderStatusHistory` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `fromStatus` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED') NULL,
    `toStatus` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED') NOT NULL,
    `changedByUserId` VARCHAR(191) NOT NULL,
    `changedByName` VARCHAR(191) NOT NULL,
    `changedByRole` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OrderStatusHistory_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Order_assignedDeliveryPersonId_idx` ON `Order`(`assignedDeliveryPersonId`);

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_assignedDeliveryPersonId_fkey` FOREIGN KEY (`assignedDeliveryPersonId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStatusHistory` ADD CONSTRAINT `OrderStatusHistory_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
