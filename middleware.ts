import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Les pages publiques qui ne nécessitent pas d'authentification
const publicPaths = [
  '/auth',
  '/auth/login',
  '/auth/register',
  '/auth/verify',
  '/auth/recover-password',
  '/events',
  '/places',
  '/shops',
  '/opportunities',
  '/marketplace',
  '/'
];

export function middleware(request: NextRequest) {
  // Ne rien faire pour les routes publiques
  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Pour toutes les autres routes, laisser passer et laisser le client gérer l'authentification
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};