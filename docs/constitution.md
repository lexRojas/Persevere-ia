# Constitucion del Proyecto — Persevere

**Proyecto:** Plataforma Persevere — Seguimiento del aprendizaje musical, bitácora docente y gamificación del progreso (violín).  
**Metodología:** SDD (Specification-Driven Development / Software Design Document).  
**Estado:** Borrador inicial basado en el documento de requisitos `Persevere_Requisitos (2).docx`.  
**Versión:** 1.0.0

---

## 1. Visión del producto

Convertir el aprendizaje musical de cada estudiante en un recorrido visible, documentado y estimulante. La docente conserva el control pedagógico; el estudiante visualiza su propio crecimiento como el progreso de un personaje en un videojuego, sin comparaciones públicas ni castigos por no completar actividades.

**Valor diferencial:** unir tres elementos en una sola plataforma:
1. Seguimiento pedagógico riguroso (bitácora, objetivos, evaluaciones 1–10).
2. Experiencia motivadora para el estudiante (avatar, radar de habilidades, barras de progreso, logros).
3. Apoyo inteligente a la toma de decisiones de la docente (resúmenes asistidos por IA, detección de dificultades recurrentes).

---

## 2. Principios constitucionales (no negociables)

| # | Principio | Implicación de desarrollo |
|---|-----------|---------------------------|
| P1 | **Privacidad por diseño** | La plataforma puede contener datos de menores y sus voces. Autenticación obligatoria, sesiones protegidas, permisos estrictos por rol, cifrado en tránsito y en reposo, y consentimiento explícito para grabaciones e IA. |
| P2 | **El docente valida** | Ninguna puntuación, objetivo logrado o resumen de IA se publica sin revisión y aprobación de la docente. La IA nunca asigna calificaciones automáticamente en la primera versión. |
| P3 | **Progreso propio, no competencia** | No hay clasificaciones públicas, tablas de líderes ni comparaciones humillantes entre estudiantes. El radar y las barras reflejan la evolución individual. |
| P4 | **Historial inmutable de cambios** | Se conserva quién editó, qué cambió y cuándo, principalmente en evaluaciones y bitácoras. |
| P5 | **Visibilidad segmentada** | Separar notas privadas de la docente de los contenidos publicados al estudiante o a su ensamble. |
| P6 | **Curriculum editable sin código** | Los niveles, unidades y objetivos del plan de estudios se configuran desde la interfaz; no requiere tocar el código. |
| P7 | **Accesibilidad y responsividad** | Interfaz usable en teléfono, tableta y escritorio, lectura clara en móvil, contraste suficiente y controles grandes. |
| P8 | **Archivos fuera de la base de datos** | Audio/video se guardan en almacenamiento especializado y se vinculan al expediente; nunca se almacenan binarios dentro de MySQL. |

---

## 3. Stack tecnológico (definido y aprobado)

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Framework | **Next.js** (App Router, TypeScript) | React de producción, enrutamiento basado en archivos, SSR/SSG, rutas API integradas. |
| Lenguaje | **TypeScript** (estricto) | Tipado fuerte para dominios complejos (estudiantes, evaluaciones, ensambles). |
| Estilos | **Tailwind CSS** | Interfaz responsiva, juvenil y estimulante; fácil de mantener y adaptar. |
| Componentes UI | **shadcn/ui** (opcional, sobre Radix UI) | Accesible, personalizable y coherente con Tailwind. |
| ORM / Base de datos | **Prisma + MySQL** | Modelo relacional tipado, migraciones versionadas, MySQL disponible en el entorno. |
| Autenticación | **NextAuth.js / Auth.js** | Sesiones protegidas, roles (profesora/estudiante/representante), proveedores OAuth o credenciales. |
| Validación | **Zod** | Esquemas de validación compartidos entre frontend y API. |
| Formularios | **React Hook Form + Zod** | Validación de formularios con buen DX. |
| Gráficos | **recharts** o **Chart.js** | Radar de habilidades, barras de progreso, histórico de evaluaciones. |
| Almacenamiento de archivos | Proveedor S3-compatible (R2 / S3 / similar) | Audio, video y partituras fuera de MySQL; enlaces seguros con firma temporal. |
| Despliegue | Vercel / Node.js + MySQL gestionado | Next.js nativo en Vercel; MySQL en servicio gestionado. |

---

## 4. Metodología de desarrollo: SDD

Este proyecto sigue **Specification-Driven Development (SDD)**:

1. **Especificar antes de codificar:** cada funcionalidad debe quedar documentada en `docs/sdd.md` (o en el módulo correspondiente de `skills/`) antes de escribir implementación.
2. **El agente lee primero:** cualquier cambio comienza consultando `docs/constitution.md`, `docs/agent.md` y `docs/memory.md`.
3. **Decisiones registradas:** toda decisión de arquitectura o alcance se anota en `docs/memory.md`.
4. **Validación por fases:** el MVP se entrega según la Fase 1 del documento de requisitos; no se desarrollan funcionalidades de fases futuras sin validación explícita.
5. **Revisión humana:** la docente es la fuente de verdad; todo borrador de IA requiere aprobación antes de incorporarse al expediente.

---

## 5. Usuarios, roles y permisos

| Rol | Puede hacer | Límites de acceso |
|-----|-------------|-------------------|
| Administrador | Gestionar profesores, estudiantes, ensambles, planes, cuentas y configuración de la academia. | Acceso administrativo completo dentro de la academia. |
| Profesor | Gestionar sus estudiantes, clases, evaluaciones, objetivos, repertorio y bitácoras según asignación. | Sin acceso administrativo global ni expedientes no asignados. |
| Estudiante | Consultar avances, metas, piezas, práctica, habilidades, herramientas y ensamble asignado. | Solo sus propios datos y contenidos compartidos con su ensamble. |
| Representante de menor (propuesto) | Autorizar y acompañar el acceso, consultar información habilitada, gestionar consentimientos. | Sin acceso a expedientes ajenos; permisos configurados por la academia. |

Cada estudiante tendrá una cuenta o modalidad de acceso segura. La profesora decide qué observaciones son visibles para el estudiante y cuáles permanecen solo en la bitácora docente.

En la etapa actual, cada usuario tendrá exactamente un rol y un único perfil compatible. No se contemplan múltiples roles simultáneos.

---

## 6. Alcance por fases (del documento de requisitos)

| Fase | Entregables clave | Estado |
|------|-------------------|--------|
| **1 · Base / MVP** | Usuarios, perfiles, expedientes, plan curricular editable, objetivos, repertorio, bitácora manual, evaluaciones 1–10, radar, barras y calendario de práctica. | Por desarrollar |
| **2 · Colaboración** | Ensamble, afinador, metrónomo, insignias, mejoras visuales, reportes detallados. | Futuro |
| **3 · IA docente** | Carga/grabación autorizada de audio, resúmenes revisables, búsqueda de dificultades recurrentes, biblioteca técnica autorizada. | Futuro |
| **4 · Evolución** | Planes sugeridos, notificaciones, grabación y entrega de videos, análisis audiovisual especializado, app nativa. | Futuro |

---

## 7. Reglas de funcionamiento y datos

- **Fuente de verdad:** la docente valida evaluaciones, logro de objetivos y resúmenes generados por IA.
- **Progreso calculado:** porcentaje = objetivos pertinentes logrados / objetivos pertinentes totales. Debe definirse el comportamiento cuando se modifica el plan.
- **Historial:** conservar quién editó, qué cambió y cuándo.
- **Visibilidad:** separar notas privadas docentes de contenidos publicados.
- **Notificaciones:** optativas, segunda etapa.
- **Reportes:** consulta y, posterior, exportación del seguimiento por estudiante.

---

## 8. Privacidad, menores de edad y protección de grabaciones

Antes de implementar grabaciones deben revisarse las obligaciones legales aplicables en Costa Rica y las autorizaciones correspondientes:
- Acceso mediante autenticación, sesiones protegidas y permisos estrictos por rol.
- Consentimiento y avisos claros para grabaciones, tratamiento por IA, conservación y posible compartición.
- Definir responsable de los datos, lugar/proveedor de almacenamiento, tiempo de conservación, eliminación y copias de seguridad.
- Cifrado en tránsito y en reposo, control de acceso a grabaciones y registro de consultas o descargas sensibles.
- No publicar audio, video, calificaciones ni nombres de estudiantes a otros estudiantes salvo contenidos del ensamble expresamente autorizados.
- Contratos con proveedores de IA/almacenamiento, incluyendo revisión del uso de datos para entrenamiento de modelos externos.

---

## 9. Criterios mínimos para revisar una primera versión (MVP)

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

- ¿Lanzamiento inicial solo sitio web adaptable (recomendado) o también aplicación instalable?
- ¿Quién da de alta usuarios y recupera cuentas? ¿Cómo entran los estudiantes menores de edad?
- ¿Formato real del plan curricular y cómo se definen objetivos y criterios de logro?
- ¿La docente maneja una sola academia o se prevé más profesores e instrumentos?
- ¿Basta marcar el día de práctica o se añaden minutos y actividades?
- ¿Grabaciones solo de audio al inicio? ¿Tiempo de conservación y quién las escucha?
- ¿Grabadora externa, navegador o app móvil dedicada para capturar clases?
- ¿Presupuesto para desarrollo, mantenimiento, almacenamiento e IA?

> Nota de alcance: este documento es conceptual y funcional, no un contrato ni especificación técnica definitiva. Los apartados identificados como "propuesto", "opcional", "posterior" o "fase" requieren validación antes del desarrollo.
