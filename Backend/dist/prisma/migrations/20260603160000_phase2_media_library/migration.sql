-- AlterTable
ALTER TABLE `categories` ADD COLUMN `imageAssetId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `product_images` DROP COLUMN `height`,
    DROP COLUMN `sizeBytes`,
    DROP COLUMN `thumbnailUrl`,
    DROP COLUMN `url`,
    DROP COLUMN `width`,
    ADD COLUMN `assetId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `media_assets` (
    `id` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `originalName` VARCHAR(255) NULL,
    `url` VARCHAR(500) NOT NULL,
    `thumbnailUrl` VARCHAR(500) NULL,
    `mimeType` VARCHAR(100) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `product_images_productId_assetId_key` ON `product_images`(`productId`, `assetId`);

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_imageAssetId_fkey` FOREIGN KEY (`imageAssetId`) REFERENCES `media_assets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `media_assets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

