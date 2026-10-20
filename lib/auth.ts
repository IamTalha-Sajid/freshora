import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "freshora_admin";

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set");
  if (process.env.NODE_ENV === "production" && s.length < 32) throw new Error("JWT_SECRET must be at least 32 characters in production");
  return new TextEncoder().encode(s);
}

export const SESSION_SECONDS = 60 * 60 * 24;

/** `v` is the admin's tokenVersion; bumping it in the DB (logout, password change) revokes every older token. */
export async function signAdminToken(email: string, v = 0) {
  return new SignJWT({ email, v }).setProtectedHeader({ alg: "HS256" }).setExpirationTime(`${SESSION_SECONDS}s`).sign(secret());
}

export async function verifyAdminToken(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as { email: string; v?: number };
  } catch {
    return null;
  }
}

export async function getAdmin() {
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value);
}
