import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response | object>;

/** Wraps an API handler: optional admin check, DB connect, JSON + error handling. */
export function api<C = unknown>(handler: Handler<C>, opts: { admin?: boolean } = {}) {
  return async (req: Request, ctx: C) => {
    try {
      if (opts.admin && !(await getAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      await connectDB();
      const res = await handler(req, ctx);
      return res instanceof Response ? res : NextResponse.json(res);
    } catch (e) {
      if (e instanceof ZodError) return NextResponse.json({ error: e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") }, { status: 400 });
      if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
      if ((e as { code?: number }).code === 11000) return NextResponse.json({ error: "Duplicate value (slug or SKU already exists)" }, { status: 409 });
      console.error(e);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  };
}
