# Memoria del Proyecto — Persevere

Este archivo es el diario de bordo del proyecto. Aquí se registran el estado actual, decisiones tomadas, avances y próximos pasos. **Última actualización:** 2026-10-29.

---

## Estado actual

- Requisitos extraídos de `Persevere_Requisitos (2).docx` (288 líneas, 19.752 caracteres).
- Stack definido: Next.js (App Router) + TypeScript + Tailwind CSS + MySQL + Prisma.
- Estructura de carpetas creada (ver `docs/agent.md`, sección 3).
- Documentación SDD creada: `constitution.md`, `agent.md`, `memory.md`, `sdd.md`.
- Carpeta `skills/` creada (vacía, lista para recibir skills del agente).

---

## Decisiones tomadas

| Fecha | Decisión | Justificación |
|-------|----------|---------------|
| 2026-10-23 | Usar Next.js + TypeScript + Tailwind + MySQL + Prisma | Preferencia del usuario; stack maduro, tipado fuerte, ORM tipado, interfaz responsiva. |
| 2026-10-23 | App Router de Next.js | Estándar actual de Next.js, soporte a Server Components y rutas API integradas. |
| 2026-10-23 | Almacenar audio/video fuera de MySQL (S3-compatible) | El documento recomienda explícitamente guardar archivos fuera de la BD y vincularlos al expediente. |
| 2026-10-23 | IA solo como borrador revisado por la docente | Principio P2 de la constitución: la docente valida; la IA no asigna calificaciones automáticamente (Fase 1). |
| 2026-10-23 | Roles: Profesora, Estudiante, Representante (propuesto) | Directo del documento de requisitos, sección 3. |
| 2026-10-23 | Usar pnpm como gestor de paquetes | Instalaciones reproducibles, rápidas y con uso eficiente del almacenamiento. |
| 2026-10-29 | Un rol y perfil por usuario | Simplifica autorización y navegación del MVP; múltiples roles quedan fuera de alcance. |
| 2026-10-29 | Layout administrativo independiente | Los demás perfiles podrán tener layouts diferentes. |
| 2026-10-29 | CRUD mediante lista y menú contextual | Se elimina la columna de acciones; filas y tarjetas seleccionadas controlan el menú contextual. |
| 2026-10-29 | Profesor–estudiante mediante Clase | La relación se deriva de clases compartidas; no se agregará una asignación directa. |
| 2026-10-29 | Uno o más objetivos por estudiante | `EstudianteObjetivo` conserva el estado individual; los actuales son los que están `EN_PROCESO`. |
| 2026-10-29 | Primer CRUD: Estudiantes | Se valida el patrón completo antes de replicarlo en otros módulos. |
| 2026-10-29 | Contraseña temporal administrada | El administrador define el acceso inicial; invitación por correo queda para una etapa posterior. |
| 2026-10-29 | Objetivos posteriores al alta | El expediente puede crearse sin objetivos y estos se asignan después. |
| 2026-10-29 | Estados de estudiante | Se conservan `ACTIVO`, `INACTIVO` y `BAJA`, sin eliminación física. |

---

## Avances

- [x] Extraer texto del documento de requisitos (.docx → texto plano).
- [x] Definir stack tecnológico con el usuario.
- [x] Crear estructura de carpetas del proyecto.
- [x] Crear documentación SDD (constitution.md, agent.md, memory.md, sdd.md).
- [ ] Crear carpeta `skills/` con skills iniciales.
- [x] Definir `prisma/schema.prisma` (modelo de datos).
- [x] Configurar Next.js + Tailwind + TypeScript.
- [ ] Implementar autenticación y rutas protegidas por rol.
- [ ] Implementar módulos MVP (Fase 1): estudiantes, plan curricular, objetivos, repertorio, bitácora, evaluaciones, radar, calendario de práctica.
- [x] Implementar primera iteración del panel administrativo (layout, navegación, listas y menú contextual).

## [2026-10-23] Entorno local ejecutable
- Contexto: Se solicitó instalar dependencias, generar Prisma y ejecutar la aplicación.
- Decisión: Se adoptó pnpm 12.4.2 como gestor oficial y se autorizaron únicamente los scripts nativos requeridos por Prisma.
- Resultado: Dependencias instaladas, esquema validado, migración `init` aplicada a MySQL, cliente Prisma generado, TypeScript y build aprobados, servidor disponible en `http://localhost:3000`.

## [2026-10-23] Registro por credenciales habilitado
- Contexto: El formulario de registro todavía mostraba un mensaje provisional.
- Decisión: Implementar `POST /api/auth/register` con Zod, bcrypt y Prisma; crear también el perfil de estudiante, docente o representante.
- Seguridad: Solo la primera cuenta docente puede registrarse públicamente. Las cuentas docentes adicionales requerirán administración.
- Resultado: Registro funcional y acceso automático posterior mediante NextAuth.

## [2026-10-23] Actualización de seguridad de Next.js
- Contexto: Next.js 14.2.14 reportaba vulnerabilidades conocidas.
- Decisión: Mantener compatibilidad con React 18 y actualizar dentro de la rama 14.
- Resultado: `next` y `eslint-config-next` actualizados a 14.2.35; TypeScript, Prisma y build de producción validados correctamente.

## [2026-10-23] Migración a Next.js 16 y React 19
- Contexto: Vercel recomendó migrar a Next.js 16 antes del despliegue.
- Decisión: Actualizar Next.js 16.4.3, React 19.3.1, NextAuth 4.24.15, Recharts 3.10.1, Lucide React 1.61.0 y ESLint 9.39.5.
- Cambios: `middleware.ts` migrado a `proxy.ts`; `next lint` reemplazado por ESLint CLI con Flat Config; navegación interna adaptada a `useRouter`.
- Resultado: lint sin advertencias, TypeScript válido, Prisma válido, build con Turbopack exitoso y prueba de `/registro` con HTTP 200. El servidor de prueba quedó detenido.

## [2026-10-23] Runtime de producción fijado
- Contexto: Vercel advirtió que el rango abierto `>=20.9.0` podía saltar automáticamente a una nueva versión mayor de Node.js.
- Decisión final: Fijar el runtime en `24.x`, compatible con Next.js 16 y alineado con el entorno local del proyecto.

## [2026-10-29] Inicio de SDD del panel administrativo
- Contexto: Se definió la distribución responsiva del administrador, módulos principales, columnas de listados y patrón de interacción CRUD.
- Decisión: Crear `docs/specifications/admin-dashboard.md` como SDD-ADM-001, complementario al SDD general.
- Alcance: Layout ADMIN, navegación, listas de profesores/estudiantes/planes/ensambles, menú contextual, logo, avatar genérico y criterios de aceptación.
- Pendiente: Validar decisiones del modelo de datos antes de implementar o migrar Prisma.

## [2026-10-29] Primera iteración del panel administrativo
- Contexto: El usuario autorizó iniciar la implementación de SDD-ADM-001.
- Implementación: Redirección por rol, protección ADMIN, layout responsivo, navegación, avatar genérico, resumen, listados reales y menú contextual por selección.
- Datos: Las listas consultan MySQL; campos aún no modelados muestran “Por definir”. No se modificó Prisma.
- Validación: ESLint, TypeScript, Prisma y build de Next.js aprobados. Flujo de login, selección contextual y cierre de sesión probado sin errores de consola.
- Seguridad de prueba: Se utilizó y eliminó una cuenta ADMIN temporal; no quedó información de prueba en la base local.

## [2026-10-29] CRUD administrativo de estudiantes
- Decisión: El primer CRUD completo corresponde a Estudiantes, con contraseña temporal definida por el administrador y objetivos asignables posteriormente.
- Implementación: Alta, consulta de expediente, edición y desactivación lógica desde el menú contextual.
- Seguridad: Las rutas de escritura verifican una sesión `ADMIN`; una solicitud sin sesión recibe `403`.
- Integridad: El alta crea `User` y `Estudiante` conjuntamente; la edición preserva el rol y el historial; no existe eliminación física desde la interfaz.
- Validación: ESLint, TypeScript y build de producción aprobados. Se verificaron alta, hash de contraseña, edición y cambio a `INACTIVO` contra MySQL.
- Limpieza: El estudiante usado en la prueba automatizada fue eliminado al terminar la validación.

---

## Próximos pasos (inmediatos)

1. Revisar y validar `docs/sdd.md` con el usuario (alcance, entidades, API).
2. Escribir `prisma/schema.prisma` basado en las entidades del documento (Estudiante, Clase/bitácora, Plan/objetivo, Pieza musical, Evaluación, Ensamble, Archivo/IA).
3. Configurar el proyecto Next.js (`package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `.env.example`).
4. Completar redirección posterior al login y protección separada de rutas por rol.
5. Validar SDD-ADM-001 y construir el layout del administrador.

---

## Registro de cambios

```
## [2026-10-23] Inicio del proyecto
- Contexto: Usuario solicita crear aplicación web desde cero basada en documento de requisitos de Persevere.
- Decisión: Usar Next.js + TS + Tailwind + MySQL + Prisma; metodología SDD; crear constitution.md, agent.md, memory.md y carpeta skills/.
- Justificación: Preferencia del usuario y alineación con el documento de requisitos.
- Impacto: Se crea la base del repositorio y la documentación rectora.
```
