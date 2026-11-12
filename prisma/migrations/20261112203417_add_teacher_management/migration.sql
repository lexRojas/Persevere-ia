/*
  Warnings:

  - You are about to drop the column `academiaId` on the `Docente` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Docente` DROP COLUMN `academiaId`,
    ADD COLUMN `estado` ENUM('ACTIVO', 'INACTIVO', 'ARCHIVADO') NOT NULL DEFAULT 'ACTIVO';

-- AlterTable
ALTER TABLE `User` ADD COLUMN `lastLoginAt` DATETIME(3) NULL;
