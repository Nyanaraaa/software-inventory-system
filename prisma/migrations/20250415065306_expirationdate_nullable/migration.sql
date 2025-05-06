-- AlterTable
ALTER TABLE `item` ADD COLUMN `archived` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `expirationDate` DATETIME(3) NULL;
