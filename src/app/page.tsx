import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
          Persevere
        </h1>
        <p className="text-lg text-muted-foreground">
          Seguimiento del aprendizaje musical, bitácora docente y gamificación
          del progreso para estudiantes de violín.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="inline-flex items-center justify-center rounded-md border border-input bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Crear cuenta
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          Stack: Next.js + TypeScript + Tailwind + MySQL + Prisma • Metodología
          SDD
        </p>
      </div>
    </main>
  )
}
