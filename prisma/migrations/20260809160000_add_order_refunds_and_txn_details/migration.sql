-- Razorpay refund processing + richer captured transaction details.
--  - Order.refundedAmount + PaymentStatus.PARTIALLY_REFUNDED track partial
--    refund progress; OrderRefund is the per-refund audit trail (multiple
--    partial refunds possible per order).
--  - Order.razorpay* detail columns are fetched once via payments.fetch()
--    right after payment verification, not from the client callback.

ALTER TABLE `Order` MODIFY COLUMN `paymentStatus` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED') NOT NULL DEFAULT 'PENDING';

ALTER TABLE `Order` ADD COLUMN `refundedAmount` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `Order` ADD COLUMN `razorpayMethod` VARCHAR(191) NULL;
ALTER TABLE `Order` ADD COLUMN `razorpayContact` VARCHAR(191) NULL;
ALTER TABLE `Order` ADD COLUMN `razorpayEmail` VARCHAR(191) NULL;
ALTER TABLE `Order` ADD COLUMN `razorpayVpa` VARCHAR(191) NULL;
ALTER TABLE `Order` ADD COLUMN `razorpayBank` VARCHAR(191) NULL;
ALTER TABLE `Order` ADD COLUMN `razorpayWallet` VARCHAR(191) NULL;
ALTER TABLE `Order` ADD COLUMN `razorpayCardLast4` VARCHAR(191) NULL;
ALTER TABLE `Order` ADD COLUMN `razorpayCardNetwork` VARCHAR(191) NULL;

CREATE TABLE `OrderRefund` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `amount` INTEGER NOT NULL,
  `razorpayRefundId` VARCHAR(191) NOT NULL,
  `razorpayStatus` VARCHAR(191) NOT NULL,
  `reason` VARCHAR(191) NULL,
  `processedByUserId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `OrderRefund_orderId_idx` ON `OrderRefund`(`orderId`);

ALTER TABLE `OrderRefund` ADD CONSTRAINT `OrderRefund_orderId_fkey`
  FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `OrderRefund` ADD CONSTRAINT `OrderRefund_processedByUserId_fkey`
  FOREIGN KEY (`processedByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
