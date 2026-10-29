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

export const claseSchema = z.object({
  estudianteId: z.string().cuid(),
  docenteId: z.string().cuid(),
  fecha: z.coerce.date(),
  duracion: z.number().int().positive().optional(),
  nivel: z.string().optional(),
  piezasTrabajadas: z.string().optional(),
})

export const bitacoraSchema = z.object({
  claseId: z.string().cuid(),
  objetivosSesion: z.string().optional(),
  logrosObservados: z.string().optional(),
  dificultades: z.string().optional(),
  aspectosRecurrentes: z.string().optional(),
  trabajoCasa: z.string().optional(),
  notaPrivada: z.string().optional(),
  revisionPublicacion: z.string().optional(),
})

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

export const ensambleSchema = z.object({
  nombre: z.string().min(2, 'El nombre del ensamble es requerido'),
  descripcion: z.string().optional(),
  notasCompartidas: z.string().optional(),
})
