import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Rutas protegidas del docente
    if (pathname.startsWith('/docente')) {
      if (!token || (token.role as string) !== 'TEACHER' && (token.role as string) !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
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
  matcher: ['/docente/:path*', '/alumno/:path*'],
}
