# Instrucciones del Agente — Persevere

Este archivo rige cómo debe actuar cualquier agente de IA (incluido yo) al trabajar en el repositorio de **Persevere**. Lee este archivo **antes** de hacer cambios. Complementa `docs/constitution.md` y `docs/memory.md`.

---

## 1. Metodología de trabajo: SDD (Specification-Driven Development)

No escribas código de funcionalidad sin antes:

1. Leer `docs/constitution.md` (principios no negociables).
2. Leer `docs/sdd.md` (especificación funcional y técnica).
3. Verificar que el requerimiento esté mapeado a un ID funcional (`RF-01` … `RF-19`) o de IA (`IA-01` … `IA-05`).
4. Registrar la intención y la decisión en `docs/memory.md`.
5. Implementar, probar y luego actualizar `docs/memory.md` con lo hecho.

Si un requerimiento no está en el SDD o está marcado como "propuesto/opcional/posterior", **no lo implementes sin consultar al usuario**.

---

## 2. Stack y convenciones de código

| Capa | Tecnología | Reglas |
|------|-----------|--------|
| Framework | Next.js 16 (App Router) | Usar Server Components por defecto; Client Components solo cuando sea necesario (`'use client'`). Consultar primero las reglas versionadas indicadas en `AGENTS.md`. |
| Lenguaje | TypeScript (estricto) | No usar `any`. Tipos en `src/types/`. Interfaces exportadas con PascalCase. |
| Estilos | Tailwind CSS | Clases utilitarias; diseño mobile-first; componentes en `src/components/`. |
| UI base | shadcn/ui sobre Radix UI | Componentes accesibles; no reinventar controles comunes (botón, input, diálogo, etc.). |
| ORM | Prisma + MySQL | Schema único en `prisma/schema.prisma`. Un solo cliente Prisma singleton en `src/lib/db.ts`. |
| Validación | Zod | Esquemas en `src/lib/validations.ts`, compartidos entre API y formularios. |
| Autenticación | NextAuth.js / Auth.js | Sesiones protegidas; middleware para proteger rutas por rol. |
| Formularios | React Hook Form + Zod resolver | Validación en cliente y servidor. |
| Gráficos | recharts | Radar de habilidades, barras de progreso, histórico. |
| Archivos | Almacenamiento S3-compatible | Nunca guardar binarios en MySQL; guardar URL/key en la BD. |

### Convenciones de nomenclatura

- Archivos y carpetas: `kebab-case` (ej. `student-profile.tsx`, `teacher-dashboard/`).
- Componentes React: `PascalCase` (ej. `StudentAvatar.tsx`, `SkillRadar.tsx`).
- Funciones y variables: `camelCase`.
- Constantes y tipos: `PascalCase` para tipos/interfaces, `UPPER_SNAKE_CASE` para constantes.
- Rutas de API: `src/app/api/[recurso]/route.ts`.
- Migraciones Prisma: `prisma/migrations/<timestamp>_<descripcion>/`.

---

## 3. Estructura de directorios esperada

```
src/
  app/                 # Next.js App Router (rutas y layouts)
    (auth)/            # Auth group: login, registro, recuperación
    (dashboard)/       # Dashboard group (layout protegido)
      teacher/         # Vistas de la docente
      student/         # Vistas del estudiante
    api/               # Rutas API (Next.js route handlers)
    layout.tsx         # Layout raíz
    page.tsx           # Landing / redirección por rol
  components/          # Componentes React
    ui/                # shadcn/ui base (botón, input, diálogo, etc.)
    student/           # Componentes exclusivos del estudiante
    teacher/           # Componentes exclusivos de la docente
    ensemble/          # Componentes de ensamble
    common/            # Componentes compartidos
  lib/                 # Utilidades y configuración
    db.ts              # Prisma client singleton
    auth.ts            # Configuración de Auth.js
    validations.ts     # Esquemas Zod
    utils.ts           # Utilidades varias (cn, clsx, formatters)
  types/               # Tipos TypeScript globales
  hooks/               # Hooks personalizados
prisma/
  schema.prisma        # Modelo de datos
  migrations/          # Migraciones versionadas
  seed.ts              # Datos semilla (plan curricular base)
```

---

## 4. Flujo de implementación de una funcionalidad

1. **Especificar:** redactar en `docs/sdd.md` el requerimiento, ID (`RF-xx`), entrada, salida, reglas de negocio y pantallas afectadas.
2. **Modelo de datos:** actualizar `prisma/schema.prisma` si hay nuevas entidades o relaciones; crear migración.
3. **Validación:** crear/actualizar esquema Zod en `src/lib/validations.ts`.
4. **API:** crear ruta en `src/app/api/...` con validación de entrada, autorización por rol y respuesta tipada.
5. **UI:** crear componente en la carpeta correspondiente (`student/`, `teacher/`, etc.) usando Tailwind y shadcn/ui.
6. **Integración:** conectar página de `src/app/...` con la API y los componentes.
7. **Documentar:** registrar el cambio en `docs/memory.md`.

---

## 5. Seguridad y privacidad (obligatorio)

- Nunca expongas datos de un estudiante a otro rol sin filtro por `userId` / `studentId`.
- Las rutas del docente requieren rol `TEACHER` o `ADMIN`; verifica en `proxy.ts` y en cada route handler.
- Las grabaciones y resultados de IA son borradores hasta que la docente los apruebe.
- No almacenes binarios de audio/video en la base de datos.
- Usa HTTPS y cookies seguras para sesiones.

---

## 6. Cuando debes pedir confirmación al usuario

Pide confirmación antes de:
- Cambiar el stack tecnológico aprobado.
- Implementar funcionalidades de fases 2, 3 o 4 (IA, grabaciones, notificaciones, app nativa).
- Modificar el modelo de datos de forma destructiva (eliminar tablas/campos).
- Integrar proveedores externos de IA o almacenamiento con costo.
- Cambiar la estrategia de autenticación o autorización.

---

## 7. Comandos de referencia (según package.json)

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar en producción
npm start

# Linter y types
npm run lint
npx tsc --noEmit

# Prisma
npx prisma generate            # Generar cliente Prisma
npx prisma migrate dev         # Crear y aplicar migración en desarrollo
npx prisma migrate deploy      # Aplicar migraciones en producción
npx prisma db seed             # Cargar datos semilla
npx prisma studio              # Interfaz visual de la base de datos
```

---

## 8. Registro de decisiones (memoria)

Toda decisión relevante debe anexarse al final de `docs/memory.md` con el formato:

```
## [YYYY-MM-DD] <Título de la decisión>
- Contexto: ...
- Decisión: ...
- Justificación: ...
- Impacto: ...
```
