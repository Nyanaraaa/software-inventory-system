/*
  Warnings:

  - You are about to alter the column `status` on the `vendor` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(191)`.

*/
-- DropIndex
DROP INDEX `Item_vendorId_fkey` ON `item`;

-- DropIndex
DROP INDEX `LicenseKey_itemId_fkey` ON `licensekey`;

-- DropIndex
DROP INDEX `Renewal_itemId_fkey` ON `renewal`;

-- AlterTable
ALTER TABLE `vendor` MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE';

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `Vendor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LicenseKey` ADD CONSTRAINT `LicenseKey_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Renewal` ADD CONSTRAINT `Renewal_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
