-- AlterTable
ALTER TABLE `variants` ADD COLUMN `imageAssetId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `variants_imageAssetId_idx` ON `variants`(`imageAssetId`);

-- AddForeignKey
ALTER TABLE `variants` ADD CONSTRAINT `variants_imageAssetId_fkey` FOREIGN KEY (`imageAssetId`) REFERENCES `media_assets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
