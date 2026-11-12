/*
  Warnings:

  - You are about to drop the column `academiaId` on the `docente` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `docente` DROP COLUMN `academiaId`,
    ADD COLUMN `estado` ENUM('ACTIVO', 'INACTIVO', 'ARCHIVADO') NOT NULL DEFAULT 'ACTIVO';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `lastLoginAt` DATETIME(3) NULL;
