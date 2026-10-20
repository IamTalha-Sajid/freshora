import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { api, HttpError } from "@/lib/api";
import { ADMIN_COOKIE, SESSION_SECONDS, getAdmin, signAdminToken } from "@/lib/auth";
import { Admin } from "@/lib/models/Admin";
import { clientIp, rateLimit } from "@/lib/ratelimit";

const body = z.object({ current: z.string().min(1), next: z.string().min(10, "Use at least 10 characters").max(200) });

export const PUT = api(
  async (req) => {
    rateLimit(`pw:${clientIp(req)}`, 5, 15 * 60_000);
    const { current, next } = body.parse(await req.json());
    const session = await getAdmin();
    const admin = await Admin.findOne({ email: session!.email });
    if (!admin || !(await bcrypt.compare(current, admin.passwordHash))) throw new HttpError(400, "Current password is wrong");
    admin.passwordHash = await bcrypt.hash(next, 10);
    admin.tokenVersion = (admin.tokenVersion ?? 0) + 1; // signs out every other session
    await admin.save();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, await signAdminToken(admin.email, admin.tokenVersion), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_SECONDS,
    });
    return res;
  },
  { admin: true }
);
