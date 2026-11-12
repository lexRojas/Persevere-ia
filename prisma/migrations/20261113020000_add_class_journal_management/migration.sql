ALTER TABLE `Clase`
    ADD COLUMN `estado` ENUM('PROGRAMADA', 'REALIZADA', 'CANCELADA') NOT NULL DEFAULT 'PROGRAMADA',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

ALTER TABLE `BitacoraClase`
    ADD COLUMN `estado` ENUM('BORRADOR', 'APROBADA') NOT NULL DEFAULT 'BORRADOR',
    ADD COLUMN `version` INTEGER NOT NULL DEFAULT 1;

UPDATE `BitacoraClase`
SET `estado` = CASE WHEN `aprobadoPorDocente` = true THEN 'APROBADA' ELSE 'BORRADOR' END;

ALTER TABLE `BitacoraClase`
    DROP COLUMN `aprobadoPorDocente`;

CREATE TABLE `BitacoraRevision` (
    `id` VARCHAR(191) NOT NULL,
    `bitacoraId` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `objetivosSesion` VARCHAR(191) NULL,
    `logrosObservados` VARCHAR(191) NULL,
    `dificultades` VARCHAR(191) NULL,
    `aspectosRecurrentes` VARCHAR(191) NULL,
    `trabajoCasa` VARCHAR(191) NULL,
    `notaPrivada` TEXT NULL,
    `revisionPublicacion` VARCHAR(191) NULL,
    `creadoPorIA` BOOLEAN NOT NULL DEFAULT false,
    `estado` ENUM('BORRADOR', 'APROBADA') NOT NULL,
    `editadoPorId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `BitacoraRevision_bitacoraId_version_key`(`bitacoraId`, `version`),
    INDEX `BitacoraRevision_editadoPorId_idx`(`editadoPorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `BitacoraRevision`
    ADD CONSTRAINT `BitacoraRevision_bitacoraId_fkey` FOREIGN KEY (`bitacoraId`) REFERENCES `BitacoraClase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `BitacoraRevision_editadoPorId_fkey` FOREIGN KEY (`editadoPorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
