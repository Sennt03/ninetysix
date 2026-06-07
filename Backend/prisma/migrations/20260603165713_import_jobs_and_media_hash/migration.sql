-- AlterTable
ALTER TABLE `media_assets` ADD COLUMN `hash` VARCHAR(64) NULL;

-- CreateTable
CREATE TABLE `import_jobs` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('products', 'categories', 'images') NOT NULL,
    `originalName` VARCHAR(255) NOT NULL,
    `filePath` VARCHAR(500) NOT NULL,
    `status` ENUM('pending', 'processing', 'completed', 'completed_with_errors', 'failed') NOT NULL DEFAULT 'pending',
    `totalRows` INTEGER NOT NULL DEFAULT 0,
    `processedRows` INTEGER NOT NULL DEFAULT 0,
    `successCount` INTEGER NOT NULL DEFAULT 0,
    `errorCount` INTEGER NOT NULL DEFAULT 0,
    `createdCount` INTEGER NOT NULL DEFAULT 0,
    `updatedCount` INTEGER NOT NULL DEFAULT 0,
    `message` VARCHAR(500) NULL,
    `userId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `startedAt` DATETIME(3) NULL,
    `finishedAt` DATETIME(3) NULL,

    INDEX `import_jobs_type_createdAt_idx`(`type`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `import_job_rows` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `rowNumber` INTEGER NOT NULL,
    `identifier` VARCHAR(255) NULL,
    `status` ENUM('ok', 'error', 'skipped') NOT NULL,
    `action` ENUM('created', 'updated', 'none') NOT NULL DEFAULT 'none',
    `message` VARCHAR(500) NULL,
    `rawData` JSON NULL,

    INDEX `import_job_rows_jobId_status_idx`(`jobId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `media_assets_hash_key` ON `media_assets`(`hash`);

-- AddForeignKey
ALTER TABLE `import_job_rows` ADD CONSTRAINT `import_job_rows_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `import_jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

