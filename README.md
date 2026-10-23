# Persevere

Plataforma de seguimiento del aprendizaje musical, bitácora docente y gamificación del progreso (violín).

## Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Estilos:** Tailwind CSS
- **ORM / Base de datos:** Prisma + MySQL
- **Autenticación:** NextAuth.js / Auth.js
- **Validación:** Zod
- **Gráficos:** recharts

## Documentación (SDD)

| Archivo | Descripción |
|---------|-------------|
| `docs/constitution.md` | Constitución del proyecto: principios, stack, roles, fases, privacidad. |
| `docs/agent.md` | Instrucciones del agente: metodología SDD, convenciones, flujo de trabajo. |
| `docs/memory.md` | Memoria del proyecto: estado, decisiones, avances, próximos pasos. |
| `docs/sdd.md` | Software Design Document: requisitos, modelo de datos, API, UI/UX, criterios MVP. |
| `skills/` | Carpeta para guardar skills del agente. |

## Primeros pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env
# Edita .env con tu DATABASE_URL (MySQL) y NEXTAUTH_SECRET

# 3. Generar cliente Prisma
npx prisma generate

# 4. Crear y aplicar la primera migración
npx prisma migrate dev --name init

# 5. Cargar datos semilla (opcional)
npx prisma db seed

# 6. Ejecutar en desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Estructura de carpetas

```
src/app/          # Next.js App Router (rutas y layouts)
src/components/   # Componentes React (ui, student, teacher, ensemble, common)
src/lib/          # Utilidades (db, auth, validaciones)
src/types/        # Tipos TypeScript
src/hooks/        # Hooks personalizados
prisma/           # Esquema y migraciones de Prisma
docs/             # Documentación SDD
skills/           # Skills del agente
```

## Criterios de aceptación MVP (Fase 1)

1. La profesora crea un estudiante, le asigna nivel y registra una clase con observaciones y tareas.
2. Puede cargar o editar el plan de estudios, marcar un objetivo como logrado y ver actualizado el porcentaje.
3. El alumno entra únicamente a su perfil y comprende qué sabe hacer, qué estudia y cuál es su siguiente meta.
4. El repertorio distingue piezas en estudio y completadas; una pieza muestra su avance individual.
5. La docente registra dos evaluaciones en fechas diferentes y el radar y el histórico reflejan los datos correctos.
6. El estudiante registra práctica en un día concreto; profesora y estudiante ven el dato en el calendario.
7. La profesora decide qué nota permanece privada y cuál puede ver el alumno.
8. La interfaz funciona en teléfono, tableta y escritorio sin perder las funciones esenciales.

## Privacidad

Antes de implementar grabaciones de audio/video y la capa de IA, revisar las obligaciones legales aplicables (Costa Rica) y obtener los consentimientos correspondientes. Ver `docs/constitution.md`, sección 8.
