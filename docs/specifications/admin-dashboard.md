# SDD-ADM-001 — Panel administrativo de Persevere

- **Proyecto:** Persevere — Academia de Música
- **Módulo:** Experiencia y gestión del perfil administrador
- **Versión:** 0.2.0
- **Fecha:** 2026-10-29
- **Estado:** Validada; primera iteración en implementación
- **Trazabilidad:** RF-01, RF-04, RF-05, RF-17 y decisiones de diseño aprobadas

---

## 1. Objetivo

Definir la estructura funcional, visual y responsiva del panel utilizado por el rol `ADMIN` para gestionar profesores, estudiantes, planes de estudio y ensambles.

Esta especificación cubre exclusivamente al administrador. `TEACHER`, `STUDENT` y `REPRESENTATIVE` podrán utilizar layouts y menús diferentes en especificaciones posteriores.

## 2. Alcance

### Incluido

- Layout administrativo para PC/TV, tableta y móvil.
- Encabezado con logo, buscador global y avatar.
- Menú principal y menú contextual.
- Listados responsivos de profesores, estudiantes, planes y ensambles.
- Selección individual y múltiple de registros.
- Base de interacción CRUD desde las listas.
- Regla de un rol y perfil por usuario.
- Avatar genérico inicial.
- Accesibilidad y estados de interfaz.

### Fuera de alcance

- Layouts de profesor, estudiante y representante.
- Fotografía o avatar personalizable.
- Fichas y formularios definitivos de cada entidad.
- IA, grabaciones, herramientas musicales e insignias.
- Permisos granulares y múltiples roles por usuario.

---

## 3. Identidad, roles y perfiles

### ADM-ID-001 — Un rol por usuario

Cada `User` tendrá exactamente uno de estos roles:

- `ADMIN`
- `TEACHER`
- `STUDENT`
- `REPRESENTATIVE`

### ADM-ID-002 — Un perfil compatible

```text
User (ADMIN)          -> sin perfil académico adicional
User (TEACHER)        -> un único Docente
User (STUDENT)        -> un único Estudiante
User (REPRESENTATIVE) -> un único Representante
```

La aplicación debe impedir perfiles incompatibles con el rol. Una persona no podrá ser administradora y profesora con la misma cuenta durante esta etapa.

### ADM-DATA-001 — Relación profesor–estudiante mediante clases

No existirá una asignación directa entre `Docente` y `Estudiante`. Su relación se deriva de `Clase`, porque cada clase pertenece a un docente y a un estudiante.

```text
Docente 1 ──< Clase >── 1 Estudiante
```

Un profesor se considera relacionado con un estudiante cuando existe al menos una clase entre ambos. La cantidad de estudiantes de un profesor se calcula contando estudiantes distintos y activos presentes en sus clases.

### ADM-DATA-002 — Objetivos del estudiante

Cada estudiante puede tener uno o más objetivos. La relación se representa mediante `EstudianteObjetivo`:

```text
Estudiante 1 ──< EstudianteObjetivo >── 1 Objetivo
```

Un mismo objetivo curricular puede estar asociado a varios estudiantes. Cada asociación conserva su propio estado, fecha y observación docente.

Los objetivos actuales son aquellos cuyo estado sea `EN_PROCESO`. Si existen varios, el listado administrativo mostrará una representación compacta —primer objetivo y cantidad adicional— mientras que la ficha del estudiante mostrará la colección completa. No se requiere un campo de prioridad en esta etapa.

---

## 4. Navegación

### ADM-NAV-001 — Menú principal

1. Inicio.
2. Profesores.
3. Estudiantes.
4. Planes de estudio.
5. Ensambles.

En la zona inferior se podrán ubicar Configuración y Cerrar sesión.

### ADM-NAV-002 — Rutas propuestas

```text
/admin
/admin/profesores
/admin/profesores/nuevo
/admin/profesores/[id]
/admin/estudiantes
/admin/estudiantes/nuevo
/admin/estudiantes/[id]
/admin/planes-estudio
/admin/planes-estudio/nuevo
/admin/planes-estudio/[id]
/admin/ensambles
/admin/ensambles/nuevo
/admin/ensambles/[id]
```

Todas las rutas `/admin/**` requieren sesión con rol `ADMIN`. Las APIs y acciones de servidor también deben comprobar el rol; ocultar opciones del menú no constituye autorización.

### ADM-NAV-003 — Estado activo

- El módulo actual tendrá fondo e indicador visual.
- Su identificación no dependerá solo del color.
- En modo contraído, los iconos tendrán nombre accesible y tooltip.

---

## 5. Layout responsivo

### PC / TV

```text
┌────────────────────────────────────────────────────────────────┐
│ Logo                 Buscador global                    Avatar │
├──────────────┬──────────────────────────────┬──────────────────┤
│ Menú         │ Lista de datos / formularios │ Menú contextual  │
│ principal    │                              │                  │
└──────────────┴──────────────────────────────┴──────────────────┘
```

- Menú principal izquierdo.
- Contenido central flexible.
- Menú contextual derecho y accesible durante el desplazamiento.
- Ancho máximo de contenido para evitar expansión excesiva en TV.
- Menú principal contraíble de etiquetas + iconos a solo iconos.

### Tableta

```text
┌──────────────────────────────────────────────────┐
│ Logo             Buscador                 Avatar │
├──────────────┬───────────────────────────────────┤
│ Menú         │ Lista de datos / formularios     │
│ principal    │                                   │
├──────────────┴───────────────────────────────────┤
│ Menú contextual                                  │
└──────────────────────────────────────────────────┘
```

- Menú principal reducido a la izquierda.
- Menú contextual debajo del contenido o como panel inferior fijo.
- Las columnas exactas quedan pendientes de validación visual.

### Móvil

```text
┌──────────────────────────────────────┐
│ Avatar                    Buscador   │
├──────────────────────────────────────┤
│ Menú contextual                     │
├───────┬──────────────────────────────┤
│ Menú  │ Tarjetas de datos /          │
│ de    │ formularios                  │
│ iconos│                              │
└───────┴──────────────────────────────┘
```

- Menú principal vertical de iconos.
- Los listados se transforman en tarjetas.
- Menú contextual colapsable o presentado como panel inferior.
- Controles táctiles con área mínima aproximada de 44 × 44 px.

### Breakpoints iniciales

- Móvil: `< 768px`.
- Tableta: `768px–1023px`.
- Escritorio: `>= 1024px`.
- Pantalla amplia/TV: `>= 1536px`.

---

## 6. Identidad visual

### ADM-BRAND-001 — Logo

Se recibió la referencia horizontal “Persevere — Academia de Música”, con símbolo naranja/rojo y texto gris oscuro.

- PC/TV y tableta: logo horizontal completo.
- Móvil o menú contraído: símbolo reducido, pendiente de obtener.
- Pendiente: SVG o PNG transparente, confirmar fondo y preparar variantes clara, oscura y favicon.

### ADM-BRAND-002 — Avatar genérico

- Recurso local genérico y circular.
- 40–48 px en PC/TV, 40 px en tableta y 36–40 px en móvil.
- Texto alternativo: “Avatar del usuario”.
- Si `avatarUrl` no existe o falla, se utiliza el avatar genérico.
- El menú del avatar podrá contener Mi cuenta, Configuración y Cerrar sesión.

---

## 7. Buscador global

El encabezado incluirá búsqueda de profesores, estudiantes, planes y ensambles. Los resultados se agruparán por tipo y navegarán a la ficha correspondiente. No reemplaza los filtros locales de cada módulo.

---

## 8. Patrón de listas y CRUD

### ADM-LIST-001 — Lista maestra

Cada módulo mostrará:

- Título y total de registros.
- Búsqueda local, filtros y ordenamiento.
- Paginación o carga progresiva.
- Estados de carga, vacío, sin resultados y error.

### ADM-LIST-002 — Sin columna Acciones

No existirá columna `Acciones` en ningún breakpoint. Las operaciones se concentran en el menú contextual.

### ADM-LIST-003 — Selección individual

- Toda fila o tarjeta será seleccionable por clic, toque o teclado.
- La selección tendrá fondo, indicador lateral y `aria-selected`.
- El menú contextual identificará el registro seleccionado.
- `Enter` y barra espaciadora permitirán seleccionar con teclado.

### ADM-LIST-004 — Selección múltiple

- Será un modo explícito.
- Al activarlo se mostrarán casillas.
- El menú contextual indicará la cantidad seleccionada.
- Solo mostrará acciones válidas para todo el conjunto.

### ADM-LIST-005 — Eliminación lógica

La interfaz ordinaria utilizará estados Activo, Inactivo o Archivado. No eliminará físicamente historiales pedagógicos. Las operaciones destructivas requerirán confirmación.

---

## 9. Menú contextual

### Sin selección

- Crear registro.
- Buscar o filtrar.
- Exportar cuando se habilite.
- Consultar archivados.

### Un registro seleccionado

- Identidad del registro.
- Ver detalle.
- Editar.
- Activar, desactivar o archivar.
- Acciones propias del módulo.

### Varios registros seleccionados

- Cantidad seleccionada.
- Acciones masivas permitidas.
- Limpiar selección.

### Ubicación

- PC/TV: panel derecho.
- Tableta: panel inferior.
- Móvil: panel colapsable o `bottom sheet`.

---

## 10. Listado de estudiantes

### PC / TV

| Campo | Fuente esperada |
|-------|-----------------|
| Nombre | `User.name` asociado a `Estudiante` |
| Nivel | `Estudiante.nivel` |
| Estado | `Estudiante.estado` |
| Objetivos actuales | `EstudianteObjetivo` con estado `EN_PROCESO`; primer objetivo y cantidad adicional |
| Última clase | Máxima fecha de `Clase` pasada |
| Última práctica | Máxima fecha de `Practica` |
| Ensamble | Ensambles activos del estudiante |

### Móvil

- Nombre.
- Nivel.
- Estado.

### Acciones contextuales

Nuevo estudiante, ver expediente, editar, asignar nivel/plan, registrar clase, gestionar repertorio, agregar a ensamble y activar/desactivar/archivar.

---

## 11. Listado de profesores

### PC / TV

| Campo | Fuente esperada |
|-------|-----------------|
| Nombre | `User.name` asociado a `Docente` |
| Especialidad | `Docente.especialidad` |
| Estado | Estado operativo del profesor |
| Cantidad de estudiantes | Conteo distinto de estudiantes activos presentes en clases del profesor |
| Próxima clase | Menor fecha futura programada |
| Último acceso | Última autenticación exitosa |

### Móvil

- Nombre.
- Especialidad.
- Estado.

### Acciones contextuales

Nuevo profesor, ver perfil, editar, consultar estudiantes, ver agenda, gestionar acceso y activar/desactivar/archivar.

---

## 12. Listado de planes de estudio

### PC / TV

| Campo | Fuente esperada |
|-------|-----------------|
| Nombre | `PlanEstudios.nombre` |
| Versión | `PlanEstudios.version` |
| Niveles | Niveles relacionados |
| Cantidad de objetivos | Conteo de `Objetivo` |
| Estado | Borrador, activo o archivado |
| Fecha de actualización | `PlanEstudios.updatedAt` |

### Móvil

- Nombre.
- Versión.
- Estado.
- Fecha de actualización.

### Acciones contextuales

Nuevo plan, ver estructura, editar niveles/objetivos, duplicar, crear versión y publicar/archivar.

---

## 13. Listado de ensambles

### PC / TV

| Campo | Fuente esperada |
|-------|-----------------|
| Nombre | `Ensamble.nombre` |
| Profesor responsable | Relación con `Docente` |
| Integrantes | Conteo de integrantes activos |
| Repertorio activo | Piezas activas asociadas |
| Próximo ensayo | Próximo evento de ensayo |
| Estado | Activo, inactivo o archivado |

### Móvil

- Nombre.
- Profesor responsable.
- Estado.

### Acciones contextuales

Nuevo ensamble, ver detalle, editar, gestionar integrantes, asignar repertorio, programar ensayo y activar/desactivar/archivar.

---

## 14. Estados de interfaz

Cada listado y formulario contemplará: cargando, vacío, sin coincidencias, error recuperable, guardando, guardado, validación fallida, confirmación de archivado y sesión expirada.

---

## 15. Impacto en el modelo de datos

| Necesidad | Estado actual | Acción requerida |
|-----------|---------------|------------------|
| Perfil compatible con rol | No garantizado por BD | Validar en transacciones y pruebas |
| Estado de profesor | No existe | Agregar estado operativo |
| Profesor–estudiante | Resuelto mediante `Clase` | No crear relación directa; calcular estudiantes distintos por docente |
| Último acceso | No existe | Agregar `lastLoginAt` o registro de acceso |
| Objetivos actuales | Resuelto mediante `EstudianteObjetivo` | Usar asociaciones `EN_PROCESO`; no agregar prioridad |
| Plan–nivel | Sin relación explícita | Modelar niveles aplicables |
| Estado del plan | Booleano `activo` | Evaluar enum borrador/activo/archivado |
| Responsable de ensamble | No existe | Relacionar con `Docente` |
| Próximo ensayo | No existe evento | Diseñar evento/ensayo |
| Estado de ensamble | No existe | Agregar estado operativo |

No se modificará Prisma hasta aprobar estas decisiones y diseñar una migración no destructiva.

---

## 16. Componentes propuestos

```text
AdminLayout
├── AdminHeader
│   ├── BrandLogo
│   ├── GlobalSearch
│   └── UserAvatarMenu
├── AdminMainNavigation
├── AdminContent
│   ├── ModuleHeader
│   ├── SearchAndFilters
│   ├── EntityDataTable
│   └── EntityCardList
└── ContextualMenu
    ├── ModuleActions
    ├── SelectedEntityActions
    └── BulkActions
```

---

## 17. Criterios de aceptación

1. Solo `ADMIN` puede acceder a `/admin/**`.
2. PC/TV muestra menú izquierdo, contenido central y contexto derecho.
3. Tableta ubica el menú contextual debajo del contenido.
4. Móvil presenta navegación por iconos y registros como tarjetas.
5. El menú contiene Inicio, Profesores, Estudiantes, Planes y Ensambles.
6. El módulo activo se identifica visual y semánticamente.
7. No existe columna `Acciones`.
8. Seleccionar fila/tarjeta actualiza e identifica el menú contextual.
9. Sin selección se muestran acciones generales.
10. Selección múltiple muestra cantidad y acciones grupales válidas.
11. Desactivar o archivar requiere confirmación y conserva historial.
12. El encabezado muestra logo, buscador y avatar genérico según breakpoint.
13. El avatar genérico aparece si no hay imagen válida.
14. La selección no depende solo del color.
15. Navegación, listas y contexto son operables con teclado.

---

## 18. Decisiones pendientes

1. Columnas exactas para tableta.
2. Archivo final y variantes del logo.
3. Imagen genérica definitiva del avatar.
4. Agenda de clases y ensayos futuros.
5. Creación/invitación de cuentas por el administrador.
6. Campos exactos de formularios Crear/Editar.
7. Exportaciones y acciones múltiples.

---

## 19. Orden sugerido de implementación

1. Autorización y redirección posterior al login para `ADMIN`.
2. `AdminLayout` responsivo.
3. Navegación, logo provisional y avatar genérico.
4. Lista y menú contextual reutilizables con datos simulados.
5. Decisiones y migraciones del modelo de datos.
6. Conectar Estudiantes.
7. Conectar Profesores.
8. Conectar Planes de estudio.
9. Conectar Ensambles.
10. Validar accesibilidad y todos los breakpoints.

> La base visual y el CRUD de Estudiantes están validados. Las migraciones de Prisma y los CRUD de los demás módulos requieren aprobar primero sus campos pendientes.

## 20. Estado de implementación

### Iteración 1 — completada

- Redirección posterior al login mediante `/panel`.
- Autorización exclusiva de `/admin/**` para rol `ADMIN` en Proxy y layout de servidor.
- Layout responsivo de administrador.
- Menú principal con Inicio, Profesores, Estudiantes, Planes de estudio y Ensambles.
- Encabezado con marca provisional, buscador y avatar genérico.
- Menú de avatar y cierre de sesión.
- Panel contextual general y por registro seleccionado.
- Listas responsivas conectadas a MySQL para los cuatro módulos.
- Búsqueda local por módulo.
- Selección accesible de filas y tarjetas.
- Panel de resumen con conteos reales.

### Pendiente de siguientes iteraciones

- Formularios y operaciones CRUD de Profesores, Planes de estudio y Ensambles.
- Búsqueda global funcional.
- Selección múltiple, filtros, exportación y archivado.
- Campos que requieren ampliación del modelo de datos.
- Recurso final del logo.

### Iteración 2 — CRUD de Estudiantes completado

- El primer CRUD completo será Estudiantes.
- El administrador define una contraseña temporal al crear la cuenta.
- Los objetivos se asignan después de crear el expediente; no bloquean el alta inicial.
- Estados permitidos: `ACTIVO`, `INACTIVO`, `BAJA`.
- Editar permite modificar nombre, correo, nivel, fecha de ingreso y estado.
- La contraseña podrá restablecerse opcionalmente durante la edición.
- Desactivar cambia el estado a `INACTIVO`; no elimina `User`, `Estudiante` ni historial relacionado.
- Las rutas `POST /api/admin/estudiantes` y `PATCH /api/admin/estudiantes/[id]` exigen sesión `ADMIN`.
- El alta crea `User` y `Estudiante` de forma transaccional mediante la relación anidada de Prisma.
- La interfaz ofrece alta, consulta, edición y confirmación de desactivación desde el menú contextual.
- Las acciones de estudiantes aún no implementadas se muestran deshabilitadas.
