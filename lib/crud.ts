import type { Model } from "mongoose";
import type { ZodType } from "zod";
import { api, HttpError } from "@/lib/api";
import { slugify } from "@/lib/pricing";

type Ctx = { params: Promise<{ id: string }> };

interface Opts {
  model: Model<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  schema: ZodType<Record<string, unknown>>;
  sort?: Record<string, 1 | -1>;
  populate?: string;
  hasSlug?: boolean;
}

async function uniqueSlug(model: Model<any>, base: string) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const root = slugify(base) || "item";
  let slug = root;
  for (let i = 2; await model.exists({ slug }); i++) slug = `${root}-${i}`;
  return slug;
}

/** Admin CRUD route handlers for a simple model. Use in app/api/admin/<x>/route.ts and [id]/route.ts. */
export function crud({ model, schema, sort = { createdAt: -1 }, populate, hasSlug = true }: Opts) {
  const list = api(
    async () => {
      const q = model.find().sort(sort);
      if (populate) q.populate(populate);
      return q.lean();
    },
    { admin: true }
  );

  const create = api(
    async (req) => {
      const data = schema.parse(await req.json());
      if (hasSlug) data.slug = data.slug ? await uniqueSlug(model, data.slug as string) : await uniqueSlug(model, data.name as string);
      return model.create(data);
    },
    { admin: true }
  );

  const update = api<Ctx>(
    async (req, { params }) => {
      const { id } = await params;
      const data = schema.parse(await req.json());
      if (hasSlug && !data.slug) delete data.slug;
      // Fields missing from the parsed body were blanked in the form: unset them.
      const unset: Record<string, 1> = {};
      for (const key of Object.keys(model.schema.paths)) {
        if (["_id", "__v", "createdAt", "updatedAt", "slug"].includes(key) || key.includes(".")) continue;
        if (!(key in data) && key in (schemaShapeKeys(schema) ?? {})) unset[key] = 1;
      }
      const doc = await model.findByIdAndUpdate(id, { $set: data, ...(Object.keys(unset).length ? { $unset: unset } : {}) }, { returnDocument: "after", runValidators: true });
      if (!doc) throw new HttpError(404, "Not found");
      return doc;
    },
    { admin: true }
  );

  const remove = api<Ctx>(
    async (_req, { params }) => {
      const { id } = await params;
      await model.findByIdAndDelete(id);
      return { ok: true };
    },
    { admin: true }
  );

  return { list, create, update, remove };
}

function schemaShapeKeys(schema: ZodType): Record<string, unknown> | null {
  const shape = (schema as unknown as { shape?: Record<string, unknown> }).shape;
  return shape ?? null;
}
