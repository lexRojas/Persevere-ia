ALTER TABLE `Clase`
    MODIFY `piezasTrabajadas` TEXT NULL;

ALTER TABLE `BitacoraClase`
    MODIFY `objetivosSesion` TEXT NULL,
    MODIFY `logrosObservados` TEXT NULL,
    MODIFY `dificultades` TEXT NULL,
    MODIFY `aspectosRecurrentes` TEXT NULL,
    MODIFY `trabajoCasa` TEXT NULL,
    MODIFY `revisionPublicacion` TEXT NULL;

ALTER TABLE `BitacoraRevision`
    MODIFY `objetivosSesion` TEXT NULL,
    MODIFY `logrosObservados` TEXT NULL,
    MODIFY `dificultades` TEXT NULL,
    MODIFY `aspectosRecurrentes` TEXT NULL,
    MODIFY `trabajoCasa` TEXT NULL,
    MODIFY `revisionPublicacion` TEXT NULL;
