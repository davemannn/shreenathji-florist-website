-- AlterTable
ALTER TABLE `BlogPost` ADD COLUMN `coverImageCloudinaryId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Category` ADD COLUMN `imageCloudinaryId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ProductImage` ADD COLUMN `cloudinaryId` VARCHAR(191) NULL;
