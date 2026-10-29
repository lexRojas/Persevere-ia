import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // El panel administrativo es exclusivo del rol ADMIN.
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/panel', req.url))
    }

    // Rutas protegidas del estudiante
    if (pathname.startsWith('/alumno')) {
      if (!token || (token.role as string) !== 'STUDENT') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
)

export const config = {
  matcher: ['/admin/:path*', '/docente/:path*', '/alumno/:path*'],
}
