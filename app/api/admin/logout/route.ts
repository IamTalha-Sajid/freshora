import { NextResponse } from "next/server";
import { ADMIN_COOKIE, getAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Admin } from "@/lib/models/Admin";

export async function POST() {
  // Bump the version so a copied cookie stops working too, not just this browser's copy.
  const session = await getAdmin();
  if (session) {
    await connectDB();
    await Admin.updateOne({ email: session.email }, { $inc: { tokenVersion: 1 } });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
