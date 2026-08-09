-- Wallet-based gift card redemption:
--  - Order.walletAmountUsed tracks how much of an order was paid from the
--    customer's wallet balance (User.walletBalance).
--  - GiftCard.redeemedAt/redeemedByUserId track when/by-whom a gift card's
--    value was moved into a wallet (all-or-nothing, not partial).
--  - PaymentMethod gains WALLET, for orders fully covered by wallet balance
--    (no cash due, no gateway payment — must stay visually distinct from
--    COD/RAZORPAY).

ALTER TABLE `Order` ADD COLUMN `walletAmountUsed` INTEGER NOT NULL DEFAULT 0;

ALTER TABLE `GiftCard` ADD COLUMN `redeemedAt` DATETIME(3) NULL;
ALTER TABLE `GiftCard` ADD COLUMN `redeemedByUserId` VARCHAR(191) NULL;

CREATE INDEX `GiftCard_redeemedByUserId_idx` ON `GiftCard`(`redeemedByUserId`);

ALTER TABLE `GiftCard` ADD CONSTRAINT `GiftCard_redeemedByUserId_fkey`
  FOREIGN KEY (`redeemedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Order` MODIFY COLUMN `paymentMethod` ENUM('COD', 'RAZORPAY', 'WALLET') NOT NULL;
