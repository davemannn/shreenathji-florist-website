-- CreateTable
CREATE TABLE `GiftCard` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `balance` INTEGER NOT NULL,
    `purchaserId` VARCHAR(191) NOT NULL,
    `recipientType` ENUM('SELF', 'OTHER') NOT NULL DEFAULT 'SELF',
    `recipientName` VARCHAR(191) NULL,
    `recipientEmail` VARCHAR(191) NULL,
    `recipientPhone` VARCHAR(191) NULL,
    `message` TEXT NULL,
    `deliveryDate` DATETIME(3) NULL,
    `paymentStatus` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `razorpayOrderId` VARCHAR(191) NULL,
    `razorpayPaymentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GiftCard_code_key`(`code`),
    INDEX `GiftCard_purchaserId_idx`(`purchaserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GiftCard` ADD CONSTRAINT `GiftCard_purchaserId_fkey` FOREIGN KEY (`purchaserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
