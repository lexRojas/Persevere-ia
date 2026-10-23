-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    INDEX `Account_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    INDEX `Session_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `emailVerified` DATETIME(3) NULL,
    `image` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'TEACHER', 'STUDENT', 'REPRESENTATIVE') NOT NULL DEFAULT 'STUDENT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_email_idx`(`email`),
    INDEX `User_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Nivel` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `orden` INTEGER NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlanEstudios` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191) NOT NULL DEFAULT '1.0',
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Objetivo` (
    `id` VARCHAR(191) NOT NULL,
    `planEstudiosId` VARCHAR(191) NOT NULL,
    `unidad` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `orden` INTEGER NOT NULL,
    `criteriosLogro` VARCHAR(191) NULL,

    INDEX `Objetivo_planEstudiosId_idx`(`planEstudiosId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Estudiante` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `nivelId` VARCHAR(191) NULL,
    `fechaIngreso` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `estado` VARCHAR(191) NOT NULL DEFAULT 'ACTIVO',
    `avatarUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Estudiante_usuarioId_key`(`usuarioId`),
    INDEX `Estudiante_nivelId_idx`(`nivelId`),
    INDEX `Estudiante_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EstudianteObjetivo` (
    `id` VARCHAR(191) NOT NULL,
    `estudianteId` VARCHAR(191) NOT NULL,
    `objetivoId` VARCHAR(191) NOT NULL,
    `estado` ENUM('NO_INICIADO', 'EN_PROCESO', 'LOGRADO') NOT NULL DEFAULT 'NO_INICIADO',
    `fecha` DATETIME(3) NULL,
    `observacionDocente` VARCHAR(191) NULL,

    INDEX `EstudianteObjetivo_estudianteId_idx`(`estudianteId`),
    INDEX `EstudianteObjetivo_objetivoId_idx`(`objetivoId`),
    UNIQUE INDEX `EstudianteObjetivo_estudianteId_objetivoId_key`(`estudianteId`, `objetivoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Clase` (
    `id` VARCHAR(191) NOT NULL,
    `estudianteId` VARCHAR(191) NOT NULL,
    `docenteId` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `duracion` INTEGER NULL,
    `nivel` VARCHAR(191) NULL,
    `piezasTrabajadas` VARCHAR(191) NULL,
    `creadoPorIA` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Clase_estudianteId_idx`(`estudianteId`),
    INDEX `Clase_docenteId_idx`(`docenteId`),
    INDEX `Clase_fecha_idx`(`fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BitacoraClase` (
    `id` VARCHAR(191) NOT NULL,
    `claseId` VARCHAR(191) NOT NULL,
    `objetivosSesion` VARCHAR(191) NULL,
    `logrosObservados` VARCHAR(191) NULL,
    `dificultades` VARCHAR(191) NULL,
    `aspectosRecurrentes` VARCHAR(191) NULL,
    `trabajoCasa` VARCHAR(191) NULL,
    `notaPrivada` TEXT NULL,
    `revisionPublicacion` VARCHAR(191) NULL,
    `creadoPorIA` BOOLEAN NOT NULL DEFAULT false,
    `aprobadoPorDocente` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BitacoraClase_claseId_key`(`claseId`),
    INDEX `BitacoraClase_claseId_idx`(`claseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Evaluacion` (
    `id` VARCHAR(191) NOT NULL,
    `estudianteId` VARCHAR(191) NOT NULL,
    `docenteId` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `comentario` VARCHAR(191) NULL,
    `dimensiones` JSON NOT NULL,

    INDEX `Evaluacion_estudianteId_idx`(`estudianteId`),
    INDEX `Evaluacion_docenteId_idx`(`docenteId`),
    INDEX `Evaluacion_fecha_idx`(`fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Docente` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `academiaId` VARCHAR(191) NULL,
    `especialidad` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Docente_usuarioId_key`(`usuarioId`),
    INDEX `Docente_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Representante` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `creadoAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Representante_usuarioId_key`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PiezaMusical` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `nivel` VARCHAR(191) NULL,
    `notas` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EstudiantePieza` (
    `id` VARCHAR(191) NOT NULL,
    `estudianteId` VARCHAR(191) NOT NULL,
    `piezaMusicalId` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'EN_ESTUDIO',
    `avance` INTEGER NOT NULL DEFAULT 0,
    `fechaInicio` DATETIME(3) NULL,
    `fechaCompletada` DATETIME(3) NULL,
    `observaciones` VARCHAR(191) NULL,

    INDEX `EstudiantePieza_estudianteId_idx`(`estudianteId`),
    INDEX `EstudiantePieza_piezaMusicalId_idx`(`piezaMusicalId`),
    UNIQUE INDEX `EstudiantePieza_estudianteId_piezaMusicalId_key`(`estudianteId`, `piezaMusicalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Practica` (
    `id` VARCHAR(191) NOT NULL,
    `estudianteId` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `minutos` INTEGER NULL,
    `comentario` VARCHAR(191) NULL,

    INDEX `Practica_estudianteId_idx`(`estudianteId`),
    INDEX `Practica_fecha_idx`(`fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ensamble` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `notasCompartidas` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Ensamble_nombre_idx`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EnsambleIntegrante` (
    `id` VARCHAR(191) NOT NULL,
    `ensambleId` VARCHAR(191) NOT NULL,
    `estudianteId` VARCHAR(191) NOT NULL,
    `fechaIngreso` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `EnsambleIntegrante_ensambleId_estudianteId_key`(`ensambleId`, `estudianteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EnsamblePieza` (
    `id` VARCHAR(191) NOT NULL,
    `ensambleId` VARCHAR(191) NOT NULL,
    `piezaMusicalId` VARCHAR(191) NOT NULL,
    `objetivoColectivo` VARCHAR(191) NULL,

    UNIQUE INDEX `EnsamblePieza_ensambleId_piezaMusicalId_key`(`ensambleId`, `piezaMusicalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Archivo` (
    `id` VARCHAR(191) NOT NULL,
    `claseId` VARCHAR(191) NULL,
    `estudianteId` VARCHAR(191) NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `keyStorage` VARCHAR(191) NOT NULL,
    `consentimiento` BOOLEAN NOT NULL DEFAULT false,
    `revisadoPorDocente` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Archivo_claseId_idx`(`claseId`),
    INDEX `Archivo_estudianteId_idx`(`estudianteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResultadoIA` (
    `id` VARCHAR(191) NOT NULL,
    `claseId` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `contenido` JSON NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'BORRADOR',
    `aprobadoPorDocente` BOOLEAN NOT NULL DEFAULT false,
    `aprobadoEn` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ResultadoIA_claseId_idx`(`claseId`),
    INDEX `ResultadoIA_estado_idx`(`estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Objetivo` ADD CONSTRAINT `Objetivo_planEstudiosId_fkey` FOREIGN KEY (`planEstudiosId`) REFERENCES `PlanEstudios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Estudiante` ADD CONSTRAINT `Estudiante_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Estudiante` ADD CONSTRAINT `Estudiante_nivelId_fkey` FOREIGN KEY (`nivelId`) REFERENCES `Nivel`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EstudianteObjetivo` ADD CONSTRAINT `EstudianteObjetivo_estudianteId_fkey` FOREIGN KEY (`estudianteId`) REFERENCES `Estudiante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EstudianteObjetivo` ADD CONSTRAINT `EstudianteObjetivo_objetivoId_fkey` FOREIGN KEY (`objetivoId`) REFERENCES `Objetivo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Clase` ADD CONSTRAINT `Clase_estudianteId_fkey` FOREIGN KEY (`estudianteId`) REFERENCES `Estudiante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Clase` ADD CONSTRAINT `Clase_docenteId_fkey` FOREIGN KEY (`docenteId`) REFERENCES `Docente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BitacoraClase` ADD CONSTRAINT `BitacoraClase_claseId_fkey` FOREIGN KEY (`claseId`) REFERENCES `Clase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluacion` ADD CONSTRAINT `Evaluacion_estudianteId_fkey` FOREIGN KEY (`estudianteId`) REFERENCES `Estudiante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluacion` ADD CONSTRAINT `Evaluacion_docenteId_fkey` FOREIGN KEY (`docenteId`) REFERENCES `Docente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Docente` ADD CONSTRAINT `Docente_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Representante` ADD CONSTRAINT `Representante_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EstudiantePieza` ADD CONSTRAINT `EstudiantePieza_estudianteId_fkey` FOREIGN KEY (`estudianteId`) REFERENCES `Estudiante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EstudiantePieza` ADD CONSTRAINT `EstudiantePieza_piezaMusicalId_fkey` FOREIGN KEY (`piezaMusicalId`) REFERENCES `PiezaMusical`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Practica` ADD CONSTRAINT `Practica_estudianteId_fkey` FOREIGN KEY (`estudianteId`) REFERENCES `Estudiante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnsambleIntegrante` ADD CONSTRAINT `EnsambleIntegrante_ensambleId_fkey` FOREIGN KEY (`ensambleId`) REFERENCES `Ensamble`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnsambleIntegrante` ADD CONSTRAINT `EnsambleIntegrante_estudianteId_fkey` FOREIGN KEY (`estudianteId`) REFERENCES `Estudiante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnsamblePieza` ADD CONSTRAINT `EnsamblePieza_ensambleId_fkey` FOREIGN KEY (`ensambleId`) REFERENCES `Ensamble`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnsamblePieza` ADD CONSTRAINT `EnsamblePieza_piezaMusicalId_fkey` FOREIGN KEY (`piezaMusicalId`) REFERENCES `PiezaMusical`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Archivo` ADD CONSTRAINT `Archivo_claseId_fkey` FOREIGN KEY (`claseId`) REFERENCES `Clase`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Archivo` ADD CONSTRAINT `Archivo_estudianteId_fkey` FOREIGN KEY (`estudianteId`) REFERENCES `Estudiante`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResultadoIA` ADD CONSTRAINT `ResultadoIA_claseId_fkey` FOREIGN KEY (`claseId`) REFERENCES `Clase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
