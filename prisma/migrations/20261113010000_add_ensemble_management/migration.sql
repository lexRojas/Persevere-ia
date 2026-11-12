ALTER TABLE `Ensamble`
    ADD COLUMN `estado` ENUM('ACTIVO', 'INACTIVO', 'ARCHIVADO') NOT NULL DEFAULT 'ACTIVO';

CREATE UNIQUE INDEX `Ensamble_nombre_key` ON `Ensamble`(`nombre`);

ALTER TABLE `PiezaMusical`
    ADD COLUMN `activo` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

CREATE UNIQUE INDEX `PiezaMusical_nombre_key` ON `PiezaMusical`(`nombre`);

ALTER TABLE `EnsambleIntegrante`
    ADD COLUMN `rol` VARCHAR(191) NULL,
    ADD COLUMN `activo` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `fechaRetiro` DATETIME(3) NULL;

ALTER TABLE `EnsamblePieza`
    ADD COLUMN `activo` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `fechaAsignacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `fechaRetiro` DATETIME(3) NULL;

CREATE TABLE `EnsambleDocente` (
    `id` VARCHAR(191) NOT NULL,
    `ensambleId` VARCHAR(191) NOT NULL,
    `docenteId` VARCHAR(191) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fechaAsignacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaRetiro` DATETIME(3) NULL,
    UNIQUE INDEX `EnsambleDocente_ensambleId_docenteId_key`(`ensambleId`, `docenteId`),
    INDEX `EnsambleDocente_docenteId_idx`(`docenteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Ensayo` (
    `id` VARCHAR(191) NOT NULL,
    `ensambleId` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `duracion` INTEGER NULL,
    `estado` ENUM('PROGRAMADO', 'REALIZADO', 'CANCELADO') NOT NULL DEFAULT 'PROGRAMADO',
    `notas` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `Ensayo_ensambleId_idx`(`ensambleId`),
    INDEX `Ensayo_fecha_idx`(`fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `EnsambleDocente`
    ADD CONSTRAINT `EnsambleDocente_ensambleId_fkey` FOREIGN KEY (`ensambleId`) REFERENCES `Ensamble`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `EnsambleDocente_docenteId_fkey` FOREIGN KEY (`docenteId`) REFERENCES `Docente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Ensayo`
    ADD CONSTRAINT `Ensayo_ensambleId_fkey` FOREIGN KEY (`ensambleId`) REFERENCES `Ensamble`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
