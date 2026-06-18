import { sealData, unsealData } from 'iron-session';

// Token stateless y firmado para que un builder pendiente (sin contraseña aún)
// pueda completar su presentación desde el email de la campaña. Mismo secreto
// que la sesión (SESSION_PASSWORD); el script de campaña genera tokens con la
// misma función vía `require('iron-session')`.

const PURPOSE = 'complete-profile';
export const PROFILE_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 21; // 21 días

interface ProfileTokenData {
  memberId: number;
  purpose: string;
}

function getPassword(): string {
  const pwd = process.env.SESSION_PASSWORD?.trim();
  if (!pwd || pwd.length < 32) {
    throw new Error('SESSION_PASSWORD must be set and at least 32 characters');
  }
  return pwd;
}

/** Firma un token de "completá tu presentación" para `memberId`. */
export async function createProfileToken(
  memberId: number,
  ttlSeconds: number = PROFILE_TOKEN_TTL_SECONDS,
): Promise<string> {
  return sealData({ memberId, purpose: PURPOSE }, { password: getPassword(), ttl: ttlSeconds });
}

/** Valida un token y devuelve el `memberId`, o null si es inválido/expirado. */
export async function readProfileToken(token: string | null | undefined): Promise<number | null> {
  if (!token) return null;
  try {
    const data = await unsealData<ProfileTokenData>(token, { password: getPassword() });
    if (!data || data.purpose !== PURPOSE || typeof data.memberId !== 'number') return null;
    return data.memberId;
  } catch {
    return null;
  }
}
