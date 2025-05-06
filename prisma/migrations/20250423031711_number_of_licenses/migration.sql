/*
  Warnings:

  - You are about to drop the column `numberofLicenses` on the `item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `item` DROP COLUMN `numberofLicenses`,
    ADD COLUMN `numberOfLicenses` INTEGER NULL;
