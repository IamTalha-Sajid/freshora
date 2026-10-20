import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { api, HttpError } from "@/lib/api";
import { ADMIN_COOKIE, SESSION_SECONDS, signAdminToken } from "@/lib/auth";
import { Admin } from "@/lib/models/Admin";
import { clientIp, rateLimit } from "@/lib/ratelimit";

// Compared against when the email is unknown, so response time doesn't reveal which emails are admins.
const DUMMY_HASH = "$2b$10$bxvj9z9rQZVOzS5jkNnZj.BF0SIqPG2yz95xX7zjZRfBrGPWbBa9S";

export const POST = api(async (req) => {
  const { email, password } = z.object({ email: z.string().email(), password: z.string().min(1).max(200) }).parse(await req.json());
  const e = email.toLowerCase();
  rateLimit(`login:ip:${clientIp(req)}`, 10, 15 * 60_000);
  rateLimit(`login:email:${e}`, 5, 15 * 60_000);
  const admin = await Admin.findOne({ email: e });
  const ok = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !ok) throw new HttpError(401, "Invalid email or password");
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, await signAdminToken(admin.email, admin.tokenVersion ?? 0), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return res;
});
