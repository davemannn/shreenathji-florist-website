-- AlterTable
ALTER TABLE `Category` ADD COLUMN `gstRate` INTEGER NULL,
    ADD COLUMN `hsnCode` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `cgstAmount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `igstAmount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `invoiceNumber` VARCHAR(191) NULL,
    ADD COLUMN `invoicedAt` DATETIME(3) NULL,
    ADD COLUMN `isInterState` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sellerGstin` VARCHAR(191) NULL,
    ADD COLUMN `sellerState` VARCHAR(191) NULL,
    ADD COLUMN `sgstAmount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `taxableValue` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `totalTax` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `OrderItem` ADD COLUMN `gstRate` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `hsnCode` VARCHAR(191) NULL,
    ADD COLUMN `taxAmount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `taxableValue` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `StoreSettings` ADD COLUMN `defaultGstRate` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `gstin` VARCHAR(191) NULL,
    ADD COLUMN `invoicePrefix` VARCHAR(191) NOT NULL DEFAULT 'SF',
    ADD COLUMN `lastInvoiceFY` VARCHAR(191) NULL,
    ADD COLUMN `lastInvoiceNumber` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `legalBusinessName` VARCHAR(191) NULL,
    ADD COLUMN `registeredAddressLine` VARCHAR(191) NULL,
    ADD COLUMN `registeredCity` VARCHAR(191) NULL,
    ADD COLUMN `registeredPincode` VARCHAR(191) NULL,
    ADD COLUMN `registeredState` VARCHAR(191) NOT NULL DEFAULT 'Gujarat';

-- CreateIndex
CREATE UNIQUE INDEX `Order_invoiceNumber_key` ON `Order`(`invoiceNumber`);

