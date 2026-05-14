import { getIronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export type SessionData = {
  userId?: number;
  email?: string;
  name?: string;
  mustChangePassword?: boolean;
};

function getSessionPassword(): string {
  const pwd = process.env.SESSION_PASSWORD?.trim();
  if (!pwd || pwd.length < 32) {
    throw new Error('SESSION_PASSWORD must be set and at least 32 characters');
  }
  return pwd;
}

export function sessionOptions(): SessionOptions {
  return {
    password: getSessionPassword(),
    cookieName: 'nordelta_session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    },
  };
}

export async function getSession() {
  return getIronSession<SessionData>(cookies(), sessionOptions());
}
