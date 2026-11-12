import { z } from 'zod'

// ============================================================
// Esquemas de validación compartidos (frontend y API)
// ============================================================

export const usuarioSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  email: z.string().email('Correo electrónico inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT', 'REPRESENTATIVE']).optional(),
})

export const registroSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().trim().email('Correo electrónico inválido').max(191),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede superar 72 caracteres'),
  role: z.enum(['TEACHER', 'STUDENT', 'REPRESENTATIVE']),
})

export const estudianteSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es requerido').max(100),
  email: z.string().trim().email('Correo inválido').max(191),
  nivelId: z.string().cuid('Nivel inválido').nullable().optional(),
  fechaIngreso: z.coerce.date().optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'BAJA']).default('ACTIVO'),
})

export const crearEstudianteAdminSchema = estudianteSchema.extend({
  password: z
    .string()
    .min(8, 'La contraseña temporal debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede superar 72 caracteres'),
})

export const actualizarEstudianteAdminSchema = estudianteSchema
  .partial()
  .extend({
    password: z
      .string()
      .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
      .max(72, 'La contraseña no puede superar 72 caracteres')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, 'No se recibieron cambios')

export const profesorAdminSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es requerido').max(100),
  email: z.string().trim().email('Correo inválido').max(191),
  especialidad: z.string().trim().min(2, 'La especialidad es requerida').max(100),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'ARCHIVADO']).default('ACTIVO'),
})

export const crearProfesorAdminSchema = profesorAdminSchema.extend({
  password: z
    .string()
    .min(8, 'La contraseña temporal debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede superar 72 caracteres'),
})

export const actualizarProfesorAdminSchema = profesorAdminSchema
  .partial()
  .extend({
    password: z
      .string()
      .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
      .max(72, 'La contraseña no puede superar 72 caracteres')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, 'No se recibieron cambios')

export const objetivoPlanAdminSchema = z.object({
  id: z.string().cuid('Objetivo inválido').optional(),
  unidad: z.string().trim().min(2, 'La unidad es requerida').max(100),
  descripcion: z.string().trim().min(2, 'La descripción es requerida').max(500),
  criteriosLogro: z.string().trim().max(1000).optional(),
  orden: z.number().int().positive(),
})

export const planEstudiosAdminSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es requerido').max(150),
  version: z.string().trim().min(1, 'La versión es requerida').max(30),
  estado: z.enum(['BORRADOR', 'ACTIVO', 'ARCHIVADO']).default('BORRADOR'),
  nivelIds: z.array(z.string().cuid('Nivel inválido')).default([]),
  objetivos: z.array(objetivoPlanAdminSchema).default([]),
}).superRefine((data, context) => {
  if (new Set(data.nivelIds).size !== data.nivelIds.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Hay niveles repetidos.' })
  }

  const objectiveIds = data.objetivos.flatMap((objetivo) => objetivo.id ? [objetivo.id] : [])
  if (new Set(objectiveIds).size !== objectiveIds.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Hay objetivos repetidos.' })
  }
})

export const crearPlanEstudiosAdminSchema = planEstudiosAdminSchema

export const actualizarPlanEstudiosAdminSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es requerido').max(150).optional(),
  version: z.string().trim().min(1, 'La versión es requerida').max(30).optional(),
  estado: z.enum(['BORRADOR', 'ACTIVO', 'ARCHIVADO']).optional(),
  nivelIds: z.array(z.string().cuid('Nivel inválido')).optional(),
  objetivos: z.array(objetivoPlanAdminSchema).optional(),
}).refine((data) => Object.keys(data).length > 0, 'No se recibieron cambios')

export const nivelAdminSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es requerido').max(100),
  orden: z.number().int().nonnegative('El orden no puede ser negativo'),
  descripcion: z.string().trim().max(500).optional(),
  activo: z.boolean().default(true),
})

export const crearNivelAdminSchema = nivelAdminSchema

export const actualizarNivelAdminSchema = nivelAdminSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'No se recibieron cambios')

export const bitacoraSchema = z.object({
  objetivosSesion: z.string().trim().max(5000).optional(),
  logrosObservados: z.string().trim().max(5000).optional(),
  dificultades: z.string().trim().max(5000).optional(),
  aspectosRecurrentes: z.string().trim().max(5000).optional(),
  trabajoCasa: z.string().trim().max(5000).optional(),
  notaPrivada: z.string().trim().max(10000).optional(),
  revisionPublicacion: z.string().trim().max(5000).optional(),
  estado: z.enum(['BORRADOR', 'APROBADA']).default('BORRADOR'),
})

export const claseSchema = z.object({
  estudianteId: z.string().cuid('Estudiante inválido'),
  docenteId: z.string().cuid('Profesor inválido'),
  fecha: z.coerce.date(),
  duracion: z.number().int().positive('La duración debe ser positiva').nullable().optional(),
  nivel: z.string().trim().max(100).optional(),
  piezasTrabajadas: z.string().trim().max(5000).optional(),
  estado: z.enum(['PROGRAMADA', 'REALIZADA', 'CANCELADA']).default('PROGRAMADA'),
  bitacora: bitacoraSchema.nullable().optional(),
})

export const crearClaseAdminSchema = claseSchema

export const actualizarClaseAdminSchema = z.object({
  estudianteId: z.string().cuid('Estudiante inválido').optional(),
  docenteId: z.string().cuid('Profesor inválido').optional(),
  fecha: z.coerce.date().optional(),
  duracion: z.number().int().positive('La duración debe ser positiva').nullable().optional(),
  nivel: z.string().trim().max(100).optional(),
  piezasTrabajadas: z.string().trim().max(5000).optional(),
  estado: z.enum(['PROGRAMADA', 'REALIZADA', 'CANCELADA']).optional(),
  bitacora: bitacoraSchema.nullable().optional(),
}).refine((data) => Object.keys(data).length > 0, 'No se recibieron cambios')

export const representanteAdminSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es requerido').max(100),
  email: z.string().trim().email('Correo inválido').max(191),
  telefono: z.string().trim().max(50).optional(),
  relacion: z.string().trim().max(100).optional(),
  direccion: z.string().trim().max(500).optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO']).default('ACTIVO'),
})

export const crearRepresentanteAdminSchema = representanteAdminSchema.extend({
  password: z
    .string()
    .min(8, 'La contraseña temporal debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede superar 72 caracteres'),
})

export const actualizarRepresentanteAdminSchema = representanteAdminSchema
  .partial()
  .extend({
    password: z
      .string()
      .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
      .max(72, 'La contraseña no puede superar 72 caracteres')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, 'No se recibieron cambios')

export const evaluacionSchema = z.object({
  estudianteId: z.string().cuid(),
  docenteId: z.string().cuid(),
  fecha: z.coerce.date(),
  comentario: z.string().optional(),
  dimensiones: z.object({
    afinacion: z.number().min(1).max(10),
    ritmo: z.number().min(1).max(10),
    fluidez: z.number().min(1).max(10),
    postura: z.number().min(1).max(10),
    habitosEstudio: z.number().min(1).max(10),
  }),
})

export const objetivoEstadoSchema = z.object({
  estudianteId: z.string().cuid(),
  objetivoId: z.string().cuid(),
  estado: z.enum(['NO_INICIADO', 'EN_PROCESO', 'LOGRADO']),
  fecha: z.coerce.date().optional(),
  observacionDocente: z.string().optional(),
})

export const practicaSchema = z.object({
  estudianteId: z.string().cuid(),
  fecha: z.coerce.date(),
  minutos: z.number().int().nonnegative().optional(),
  comentario: z.string().optional(),
})

export const piezaSchema = z.object({
  estudianteId: z.string().cuid(),
  piezaMusicalId: z.string().cuid(),
  estado: z.enum(['EN_ESTUDIO', 'COMPLETADA']),
  avance: z.number().int().min(0).max(100).default(0),
  observaciones: z.string().optional(),
})

const integranteEnsambleAdminSchema = z.object({
  estudianteId: z.string().cuid('Estudiante inválido'),
  rol: z.string().trim().max(100).optional(),
})

const piezaEnsambleAdminSchema = z.object({
  piezaMusicalId: z.string().cuid('Pieza musical inválida'),
  objetivoColectivo: z.string().trim().max(500).optional(),
})

const ensayoAdminSchema = z.object({
  id: z.string().cuid('Ensayo inválido').optional(),
  fecha: z.coerce.date(),
  duracion: z.number().int().positive('La duración debe ser positiva').nullable().optional(),
  estado: z.enum(['PROGRAMADO', 'REALIZADO', 'CANCELADO']).default('PROGRAMADO'),
  notas: z.string().trim().max(500).optional(),
})

export const ensambleSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre del ensamble es requerido').max(150),
  descripcion: z.string().trim().max(1000).optional(),
  notasCompartidas: z.string().trim().max(2000).optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'ARCHIVADO']).default('ACTIVO'),
  docenteIds: z.array(z.string().cuid('Profesor inválido')).default([]),
  integrantes: z.array(integranteEnsambleAdminSchema).default([]),
  piezas: z.array(piezaEnsambleAdminSchema).default([]),
  ensayos: z.array(ensayoAdminSchema).default([]),
}).superRefine((data, context) => {
  const collections = [
    { values: data.docenteIds, message: 'Hay profesores repetidos.' },
    { values: data.integrantes.map((item) => item.estudianteId), message: 'Hay integrantes repetidos.' },
    { values: data.piezas.map((item) => item.piezaMusicalId), message: 'Hay piezas repetidas.' },
    { values: data.ensayos.flatMap((item) => item.id ? [item.id] : []), message: 'Hay ensayos repetidos.' },
  ]

  for (const collection of collections) {
    if (new Set(collection.values).size !== collection.values.length) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: collection.message })
    }
  }
})

export const crearEnsambleAdminSchema = ensambleSchema

export const actualizarEnsambleAdminSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre del ensamble es requerido').max(150).optional(),
  descripcion: z.string().trim().max(1000).optional(),
  notasCompartidas: z.string().trim().max(2000).optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'ARCHIVADO']).optional(),
  docenteIds: z.array(z.string().cuid('Profesor inválido')).optional(),
  integrantes: z.array(integranteEnsambleAdminSchema).optional(),
  piezas: z.array(piezaEnsambleAdminSchema).optional(),
  ensayos: z.array(ensayoAdminSchema).optional(),
}).superRefine((data, context) => {
  if (Object.keys(data).length === 0) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'No se recibieron cambios' })
  }

  const collections = [
    { values: data.docenteIds, message: 'Hay profesores repetidos.' },
    { values: data.integrantes?.map((item) => item.estudianteId), message: 'Hay integrantes repetidos.' },
    { values: data.piezas?.map((item) => item.piezaMusicalId), message: 'Hay piezas repetidas.' },
    { values: data.ensayos?.flatMap((item) => item.id ? [item.id] : []), message: 'Hay ensayos repetidos.' },
  ]

  for (const collection of collections) {
    if (collection.values && new Set(collection.values).size !== collection.values.length) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: collection.message })
    }
  }
})

export const piezaMusicalAdminSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es requerido').max(150),
  nivel: z.string().trim().max(100).optional(),
  notas: z.string().trim().max(1000).optional(),
  activo: z.boolean().default(true),
})

export const crearPiezaMusicalAdminSchema = piezaMusicalAdminSchema

export const actualizarPiezaMusicalAdminSchema = piezaMusicalAdminSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'No se recibieron cambios')
