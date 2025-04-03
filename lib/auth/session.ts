import { cookies } from 'next/headers';

export function createUserSession(userId: string) {
  cookies().set('session', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 // 7 jours
  });
}

export function getUserSession() {
  return cookies().get('session');
}

export function clearUserSession() {
  cookies().delete('session');
}