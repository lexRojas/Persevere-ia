-- Preserve existing plan visibility while replacing the Boolean with a richer status.
ALTER TABLE `PlanEstudios`
    ADD COLUMN `estado` ENUM('BORRADOR', 'ACTIVO', 'ARCHIVADO') NOT NULL DEFAULT 'BORRADOR';

UPDATE `PlanEstudios`
SET `estado` = CASE
    WHEN `activo` = true THEN 'ACTIVO'
    ELSE 'ARCHIVADO'
END;

ALTER TABLE `PlanEstudios`
    DROP COLUMN `activo`;

-- Objectives are retired logically so student progress is never removed.
ALTER TABLE `Objetivo`
    ADD COLUMN `activo` BOOLEAN NOT NULL DEFAULT true;

-- A study plan can apply to more than one level.
CREATE TABLE `_NivelToPlanEstudios` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,
    UNIQUE INDEX `_NivelToPlanEstudios_AB_unique`(`A`, `B`),
    INDEX `_NivelToPlanEstudios_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `PlanEstudios_nombre_version_key`
    ON `PlanEstudios`(`nombre`, `version`);

ALTER TABLE `_NivelToPlanEstudios`
    ADD CONSTRAINT `_NivelToPlanEstudios_A_fkey`
    FOREIGN KEY (`A`) REFERENCES `Nivel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `_NivelToPlanEstudios`
    ADD CONSTRAINT `_NivelToPlanEstudios_B_fkey`
    FOREIGN KEY (`B`) REFERENCES `PlanEstudios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
