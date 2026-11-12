ALTER TABLE `Nivel`
    ADD COLUMN `activo` BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX `Nivel_nombre_key`
    ON `Nivel`(`nombre`);
