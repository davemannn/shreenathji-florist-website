-- Testimonials (curated homepage social proof) and FaqItem (admin-managed
-- FAQ content, replacing two hardcoded arrays that had drifted apart), plus
-- a one-review-per-user-per-product constraint now that real customer
-- review submission exists (previously only admin-seeded reviews existed).

CREATE TABLE `Testimonial` (
  `id` VARCHAR(191) NOT NULL,
  `authorName` VARCHAR(191) NOT NULL,
  `quote` TEXT NOT NULL,
  `rating` INTEGER NOT NULL DEFAULT 5,
  `photoUrl` VARCHAR(191) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `Testimonial_isActive_sortOrder_idx` ON `Testimonial`(`isActive`, `sortOrder`);

CREATE TABLE `FaqItem` (
  `id` VARCHAR(191) NOT NULL,
  `question` VARCHAR(191) NOT NULL,
  `answer` TEXT NOT NULL,
  `category` VARCHAR(191) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `FaqItem_isActive_sortOrder_idx` ON `FaqItem`(`isActive`, `sortOrder`);

CREATE UNIQUE INDEX `Review_productId_userId_key` ON `Review`(`productId`, `userId`);
