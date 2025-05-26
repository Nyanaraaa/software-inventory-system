-- DropIndex
DROP INDEX `Item_vendorId_fkey` ON `item`;

-- DropIndex
DROP INDEX `LicenseKey_itemId_fkey` ON `licensekey`;

-- DropIndex
DROP INDEX `Renewal_itemId_fkey` ON `renewal`;

-- AlterTable
ALTER TABLE `vendor` ADD COLUMN `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE';

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `Vendor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LicenseKey` ADD CONSTRAINT `LicenseKey_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Renewal` ADD CONSTRAINT `Renewal_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
