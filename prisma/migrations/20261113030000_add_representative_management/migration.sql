-- Add fields to Representante for administrative management.
ALTER TABLE `Representante`
    ADD COLUMN `nombre` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `telefono` VARCHAR(191) NULL,
    ADD COLUMN `relacion` VARCHAR(191) NULL,
    ADD COLUMN `direccion` TEXT NULL,
    ADD COLUMN `estado` VARCHAR(191) NOT NULL DEFAULT 'ACTIVO',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- Allow each student to optionally link to one representative.
ALTER TABLE `Estudiante`
    ADD COLUMN `representanteId` VARCHAR(191) NULL,
    ADD INDEX `Estudiante_representanteId_idx`(`representanteId`);

ALTER TABLE `Estudiante`
    ADD CONSTRAINT `Estudiante_representanteId_fkey`
        FOREIGN KEY (`representanteId`) REFERENCES `Representante`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
