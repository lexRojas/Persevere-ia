# SDD — Software Design Document: Persevere

**Proyecto:** Plataforma Persevere  
**Versión:** 1.0 (borrador inicial)  
**Fuente:** `Persevere_Requisitos (2).docx`  
**Metodología:** Specification-Driven Development (SDD)  
**Estado:** Por revisar con el usuario antes de implementar el MVP.

---

## 1. Introducción

Persevere es una plataforma web adaptable (teléfono, tableta, computadora) que permite a una docente de violín documentar el proceso individual de cada estudiante y al estudiante visualizar su crecimiento musical como el progreso de un personaje en un videojuego.

Incluye: bitácora de clases, repertorio, plan curricular, objetivos, evaluaciones de habilidades (1–10), calendario de práctica, ensambles, herramientas musicales (metrónomo, afinador) y una capa opcional de IA para resúmenes de lecciones (Fase 3).

---

## 2. Alcance y usuarios

### 2.1 Usuarios y roles

| Rol | Descripción | Permisos clave |
|-----|-------------|----------------|
| Profesora / administradora | Gestión completa de la academia | Crear estudiantes, ensambles, planes, clases, evaluaciones; revisar IA; ver todos los expedientes. |
| Estudiante | Consulta de su propio progreso | Ver su perfil, habilidades, piezas, práctica, ensamble asignado; registrar práctica. |
| Representante de menor (propuesto) | Autorización y acompañamiento | Gestionar consentimientos; consultar información habilitada. |

### 2.2 Alcance por fases

| Fase | Entregables |
|------|-------------|
| **1 · Base / MVP** | Usuarios, perfiles, expedientes, plan curricular editable, objetivos, repertorio, bitácora manual, evaluaciones 1–10, radar, barras, calendario de práctica. |
| **2 · Colaboración** | Ensamble, afinador, metrónomo, insignias, mejoras visuales, reportes. |
| **3 · IA docente** | Audio autorizado, resúmenes revisables, dificultades recurrentes, biblioteca técnica. |
| **4 · Evolución** | Planes sugeridos, notificaciones, video, análisis audiovisual, app nativa. |

Este SDD cubre principalmente la **Fase 1 (MVP)** y deja abiertas las decisiones de fases futuras.

---

## 3. Requerimientos funcionales (mapeados del documento)

### 3.1 Módulo 4.1 — Panel principal de la profesora

| ID | Requerimiento | Resultado esperado |
|----|---------------|--------------------|
| RF-01 | Ficha de estudiante | Datos básicos, nivel, fecha de ingreso, estado, historial, ensambles y metas. |
| RF-02 | Bitácora por clase | Fecha, objetivos trabajados, observaciones, logros, dificultades, acuerdos y tareas asignadas. |
| RF-03 | Historial unificado | Ver en orden cronológico clases, evaluaciones, cambios de repertorio y objetivos completados. |
| RF-04 | Buscador y filtros | Ubicar estudiantes y filtrar por nivel, habilidad por reforzar o estado de objetivos. |

### 3.2 Módulo 4.2 — Plan de estudios y objetivos

| ID | Requerimiento | Resultado esperado |
|----|---------------|--------------------|
| RF-05 | Catálogo curricular editable | Niveles → unidades/áreas → objetivos; cada objetivo con descripción, orden y criterios de logro. |
| RF-06 | Progreso por objetivos | Marcar no iniciado, en proceso y logrado, con fecha y observación docente. |
| RF-07 | Avance global | Proporción de objetivos logrados frente al total aplicable al itinerario del alumno. |
| RF-08 | Planes personalizados (posterior) | Seleccionar y priorizar objetivos, ejercicios y tareas a partir del historial. |

### 3.3 Módulo 4.3 — Repertorio musical

| ID | Requerimiento | Resultado esperado |
|----|---------------|--------------------|
| RF-09 | Repertorio histórico | Piezas ya interpretadas/completadas, con fechas, nivel y notas. |
| RF-10 | Piezas en curso | Lista diferenciada de piezas en estudio actualmente. |
| RF-11 | Avance de cada pieza | Etapas/metas definidas por la docente, barra visual y observaciones específicas. |
| RF-12 | Evidencias (opcional) | Adjuntar o enlazar partituras y grabaciones autorizadas. |

### 3.4 Módulo 4.4 — Evaluación periódica de habilidades

| ID | Requerimiento | Resultado esperado |
|----|---------------|--------------------|
| — | Escala 1–10 | Valorar afinación, ritmo, fluidez, postura corporal y hábitos de estudio, con fecha y comentario opcional. |
| — | Conservar historial | Todas las evaluaciones anteriores se conservan para comparar cambios (no se reemplazan). |
| — | Dimensiones editables | Las dimensiones y descripciones son editables; se podrán sumar criterios técnicos en el futuro. |
| — | Gráficos | Radar/araña de habilidades actuales + histórico de evolución por habilidad. |

### 3.5 Módulo 4.5 — Calendario digital de práctica

| ID | Requerimiento | Resultado esperado |
|----|---------------|--------------------|
| RF-13 | Registro diario | El estudiante señala los días que practicó. |
| RF-14 | Vista motivadora | Calendario visual, rachas e indicadores de constancia sin castigar pausas justificadas. |
| RF-15 | Consulta docente | La profesora ve la frecuencia de práctica. |
| RF-16 | Ampliaciones opcionales | Minutos practicados, metas de la semana y comentario del estudiante. |

### 3.6 Módulo 4.6 — Módulo de ensamble

| ID | Requerimiento | Resultado esperado |
|----|---------------|--------------------|
| RF-17 | Ficha de ensamble | Integrantes, repertorio, objetivos colectivos y notas compartidas. |
| RF-18 | Acceso segmentado | El integrante ve lo publicado para su ensamble; la profesora gestiona el grupo. |
| RF-19 | Progreso compartido (posterior) | Objetivos grupales, piezas preparadas y avisos de ensayos/presentaciones. |

### 3.7 Módulo 4.7 — Herramientas musicales de consulta

| — | Requerimiento | Resultado esperado |
|---|---------------|--------------------|
| — | Metrónomo básico | Accesible desde la pantalla del alumno. |
| — | Afinador | Requiere autorización de micrófono; funciona en teléfonos modernos dentro de las limitaciones del navegador. |

### 3.8 Módulo 5 — Inteligencia artificial (Fase 3)

| ID | Función asistida | Contenido de salida |
|----|------------------|---------------------|
| IA-01 | Resumen por lección | Temas trabajados, progresos, observaciones, dificultades y tareas futuras. |
| IA-02 | Problemas recurrentes | Aspectos que aparecen en varias clases, con referencia a fechas/evidencias. |
| IA-03 | Seguimiento de soluciones | Aspectos pendientes y los reportados como superados. |
| IA-04 | Sugerencias pedagógicas | Ejercicios y estrategias para la docente, basados en recursos autorizados. |
| IA-05 | Borrador de plan individual (posterior) | Propuesta de prioridades y ejercicios editable por la docente. |

---

## 4. Requerimientos no funcionales

| Categoría | Criterio |
|-----------|----------|
| Accesibilidad | Interfaz responsiva, lectura clara en móvil, contraste suficiente, controles grandes. |
| Privacidad | Autenticación, sesiones protegidas, permisos estrictos por rol, consentimiento para grabaciones e IA, cifrado en tránsito y en reposo. |
| Menores de edad | No publicar audio, video, calificaciones ni nombres de estudiantes a otros estudiantes salvo contenidos del ensamble autorizados. |
| Historial | Conservar quién editó, qué cambió y cuándo (evaluaciones y bitácoras). |
| Visibilidad | Separar notas privadas de la docente de contenidos publicados al estudiante o ensamble. |
| Archivos | Guardar audio/video fuera de la base de datos y vincularlos al expediente. |
| Dispositivos | Funcionar en teléfonos, tabletas y escritorios sin perder funciones esenciales. |

---

## 5. Modelo de datos (entidades y relaciones)

Entidades principales (del documento, sección 13):

```
Usuario (id, email, rol, nombre, createdAt)
  └── Estudiante (id, usuarioId, nivelId, fechaIngreso, estado, createdAt)
  └── Docente (id, usuarioId, academiaId, createdAt)

Nivel (id, nombre, orden, descripcion)
PlanEstudios (id, nombre, version, activo, createdAt)
Objetivo (id, planEstudiosId, unidad, descripcion, orden, criteriosLogro)
EstudianteObjetivo (id, estudianteId, objetivoId, estado, fecha, observacionDocente)

Clase (id, estudianteId, docenteId, fecha, duracion, nivel, piezasTrabajadas, createdAt)
BitacoraClase (id, claseId, objetivosSesion, logrosObservados, dificultades, aspectosRecurrentes, trabajoCasa, evaluacion, revisionPublicacion, creadoPorIA, aprobadoPorDocente, createdAt)

PiezaMusical (id, nombre, nivel, notas)
EstudiantePieza (id, estudianteId, piezaMusicalId, estado, avance, fechaInicio, fechaCompletada, observaciones)

Evaluacion (id, estudianteId, docenteId, fecha, comentario, dimensiones JSON)
DimensioneEvaluacion (nombre, valor 1-10)  -> embebido en Evaluacion o tabla relacionada

Ensamble (id, nombre, descripcion, notasCompartidas, createdAt)
EnsambleIntegrante (id, ensambleId, estudianteId, rol, fechaIngreso)
EnsamblePieza (id, ensambleId, piezaMusicalId, objetivoColectivo)

Practica (id, estudianteId, fecha, minutos, comentario, createdAt)

Archivo (id, claseId, estudianteId, tipo, url, keyStorage, consentimiento, revisadoPorDocente, createdAt)
ResultadoIA (id, claseId, tipo IA-01..IA-05, contenido, estado borrador/aprobado, aprobadoPorDocente, createdAt)
```

### Relaciones clave

- Un `Estudiante` pertenece a un `Nivel` y tiene muchas `Clase`, `Evaluacion`, `EstudianteObjetivo`, `EstudiantePieza`, `Practica`.
- Una `Clase` pertenece a un `Estudiante` y a una `Docente`; tiene una `BitacoraClase` y puede tener muchos `Archivo` y `ResultadoIA`.
- Un `Objetivo` pertenece a un `PlanEstudios`; su estado por estudiante está en `EstudianteObjetivo`.
- Una `PiezaMusical` se relaciona con estudiantes vía `EstudiantePieza` (estado de avance).
- Un `Ensamble` agrupa `EnsambleIntegrante` y `EnsamblePieza`.

> **Nota:** La estructura definitiva de la base de datos es decisión técnica del desarrollador, pero debe reflejar estas entidades y relaciones.

---

## 6. Arquitectura y rutas (Next.js App Router)

### 6.1 Grupos de rutas

| Ruta | Grupo | Descripción | Protección |
|------|-------|-------------|------------|
| `/` | (root) | Landing / redirección por rol | Pública |
| `/login`, `/registro`, `/recuperar` | (auth) | Autenticación | Pública |
| `/docente/...` | (dashboard) | Panel de la docente | Rol `TEACHER`/`ADMIN` |
| `/alumno/...` | (dashboard) | Panel del estudiante | Rol `STUDENT` |
| `/api/...` | — | Rutas API | Según endpoint |

### 6.2 Rutas principales (MVP)

```
GET    /api/auth/session          # Sesión actual
GET    /api/estudiantes           # Listar estudiantes (docente)
GET    /api/estudiantes/:id       # Ficha de estudiante (RF-01)
POST   /api/estudiantes           # Crear estudiante
PUT    /api/estudiantes/:id       # Editar estudiante

GET    /api/plan-estudios         # Catálogo curricular (RF-05)
POST   /api/plan-estudios/objetivos # Crear/editar objetivo

GET    /api/estudiantes/:id/objetivos # Objetivos del estudiante (RF-06, RF-07)
PATCH  /api/estudiantes/:id/objetivos/:objetivoId # Marcar objetivo (RF-06)

GET    /api/estudiantes/:id/repertorio # Piezas en curso y completadas (RF-09, RF-10)
PATCH  /api/estudiantes/:id/piezas/:piezaId # Actualizar avance de pieza (RF-11)

GET    /api/clases                # Listar clases (docente)
POST   /api/clases                # Registrar clase + bitácora (RF-02)
GET    /api/clases/:id            # Detalle de clase y bitácora

GET    /api/evaluaciones          # Listar evaluaciones de un estudiante
POST   /api/evaluaciones          # Registrar evaluación 1-10

GET    /api/practica              # Calendario de práctica (RF-13, RF-14, RF-15)
POST   /api/practica              # Registrar día de práctica

GET    /api/ensambles             # Fichas de ensamble (RF-17)
GET    /api/ensambles/:id         # Detalle de ensamble (RF-18)
```

### 6.3 Pantallas principales (del documento, sección 6.1)

**Estudiante:**
- Inicio del alumno: avatar, nivel actual, "mis habilidades", objetivo de la semana, práctica reciente y pieza principal.
- Mi progreso: radar, barras del plan de estudios, objetivos logrados y evolución por fecha.
- Mis piezas: "en estudio" y "ya interpretadas", con seguimiento individual.
- Mi práctica: calendario digital y registro rápido de días de estudio.
- Mi ensamble: sección visible solo para integrantes del grupo.
- Herramientas: afinador y metrónomo.

**Docente:**
- Inicio docente: buscador, fichas, agenda de clases, bitácoras y alertas de seguimiento.

---

## 7. Diseño UI/UX (progreso tipo videojuego)

| Elemento | Comportamiento deseado |
|----------|------------------------|
| Perfil de violinista / avatar | Identidad visual personalizable; representa el viaje musical sin competir con otros estudiantes. |
| Radar de habilidades | Ejes: afinación, ritmo, fluidez, postura, estudio. Refleja evaluaciones de la profesora. |
| Barras de progreso | Avance global del plan, avance por nivel, avance individual por pieza. |
| Misiones y objetivos | Metas concretas con estados claros (no iniciado, en proceso, logrado). |
| Logros e insignias (propuesto) | Reconocer hitos: primera pieza terminada, constancia de práctica, participación en ensamble. |
| Evolución visible | Comparar "antes" y "ahora" con gráficos históricos sencillos y mensajes positivos. |

**Principio de diseño:** premiar el esfuerzo, la constancia y el progreso propio. Evitar clasificaciones públicas, comparaciones humillantes o castigos. La estética de videojuego apoya el aprendizaje, no distrae.

---

## 8. IA y privacidad (consideraciones técnicas)

- Toda salida de IA es un **borrador asistido**: la docente revisa, corrige y aprueba antes de incorporarlo a la bitácora o compartirlo con el estudiante.
- La IA no mide postura, afinación ni calidad interpretativa por sí sola en la primera versión.
- Grabaciones: solo durante una lección activada, no micrófono abierto indiscriminadamente. Preferible subir archivo grabado externamente en la primera versión.
- Archivos fuera de MySQL; vincular al expediente con clave de almacenamiento.
- Consentimiento y avisos claros para grabaciones, tratamiento por IA, conservación y compartición.
- Revisar obligaciones legales aplicables en Costa Rica antes de implementar grabaciones.

---

## 9. Criterios de aceptación MVP (Fase 1)

1. La profesora crea un estudiante, le asigna nivel y registra una clase con observaciones y tareas.
2. Puede cargar o editar el plan de estudios, marcar un objetivo como logrado y ver actualizado el porcentaje.
3. El alumno entra únicamente a su perfil y comprende qué sabe hacer, qué estudia y cuál es su siguiente meta.
4. El repertorio distingue piezas en estudio y completadas; una pieza muestra su avance individual.
5. La docente registra dos evaluaciones en fechas diferentes y el radar y el histórico reflejan los datos correctos.
6. El estudiante registra práctica en un día concreto; profesora y estudiante ven el dato en el calendario.
7. La profesora decide qué nota permanece privada y cuál puede ver el alumno.
8. La interfaz funciona en teléfono, tableta y escritorio sin perder las funciones esenciales.

---

## 10. Decisiones pendientes para conversar con el programador

- ¿Lanzamiento inicial solo sitio web adaptable o también aplicación instalable?
- ¿Quién da de alta usuarios y recupera cuentas? ¿Cómo entran los estudiantes menores de edad?
- ¿Formato real del plan curricular y cómo se definen objetivos y criterios de logro?
- ¿Una sola academia o varios profesores e instrumentos?
- ¿Basta marcar el día de práctica o se añaden minutos y actividades?
- ¿Grabaciones solo de audio al inicio? ¿Tiempo de conservación y quién las escucha?
- ¿Grabadora externa, navegador o app móvil dedicada para capturar clases?
- ¿Presupuesto para desarrollo, mantenimiento, almacenamiento e IA?

---

> Este SDD es un documento vivo. Cualquier cambio de alcance o arquitectura debe registrarse en `docs/memory.md` y reflejarse aquí antes de implementar.
