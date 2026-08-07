-- CreateTable
CREATE TABLE `StoreSettings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'singleton',
    `baseDeliveryCharge` INTEGER NOT NULL DEFAULT 49,
    `freeDeliveryThreshold` INTEGER NOT NULL DEFAULT 999,
    `midnightCutoffHour` INTEGER NOT NULL DEFAULT 20,
    `expressCharge` INTEGER NOT NULL DEFAULT 99,
    `midnightCharge` INTEGER NOT NULL DEFAULT 199,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
