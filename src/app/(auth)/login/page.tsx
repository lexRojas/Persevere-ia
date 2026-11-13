'use client'

import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import {
  Button,
  buttonVariants,
} from '@/components/ui/button'
import {
  Input,
} from '@/components/ui/input'
import {
  Label,
} from '@/components/ui/label'

const formSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type FormValues = z.infer<typeof formSchema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormValues) => {
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Correo o contraseña incorrectos')
        return
      }

      router.replace('/panel')
      router.refresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-zinc-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Imagen del símbolo en la parte superior */}
        <div className="flex justify-center mb-8">
          <Image
            src="/images/persevere-logo.svg"
            alt="Persevere Academia de Música"
            width={200}
            height={115}
            className="drop-shadow-[0_10px_20px_rgba(239,59,35,0.25)]"
          />
        </div>

        <div>
          <h2 className="mt-2 text-3xl font-extrabold text-center tracking-tight text-zinc-900">
            Persevere
          </h2>
          <p className="mt-1 text-center text-sm text-zinc-500 font-medium">
            Academia de Música
          </p>
          <p className="mt-3 text-center text-xs text-zinc-400 uppercase tracking-widest">
            Iniciar sesión
          </p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div
              role="alert"
              className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 shadow-sm"
            >
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-zinc-700">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                className="text-sm"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-semibold text-zinc-700">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="text-sm"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" type="checkbox" className="h-4 w-4 text-[#EF3B23] focus:ring-[#EF3B23] border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-zinc-700">
                Recordar contraseña
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-[#EF3B23] hover:text-[#d9321d] focus:outline-none focus:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          <div>
            <Button type="submit" disabled={isSubmitting} className={buttonVariants({ className: 'w-full py-3 text-sm font-semibold' })}>
              {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          ¿No tienes una cuenta?{' '}
          <Link
            href="/registro"
            className="font-medium text-[#EF3B23] hover:text-[#d9321d]"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
