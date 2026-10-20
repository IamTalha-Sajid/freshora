import { isValidObjectId, type Model } from "mongoose";
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
  /** Extra checks before create/update (throw HttpError to reject). `id` is undefined on create. */
  validate?: (data: Record<string, unknown>, id?: string) => Promise<void> | void;
  /** Clean-up after a successful delete. */
  afterRemove?: (id: string) => Promise<void> | void;
  /** Numeric field changed as a delta against the value the form was loaded with (see `${field}Base`). */
  deltaField?: string;
}

async function uniqueSlug(model: Model<any>, base: string, selfId?: string) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const root = slugify(base) || "item";
  let slug = root;
  for (let i = 2; await model.exists(selfId ? { slug, _id: { $ne: selfId } } : { slug }); i++) slug = `${root}-${i}`;
  return slug;
}

function checkId(id: string) {
  if (!isValidObjectId(id)) throw new HttpError(404, "Not found");
}

/** Admin CRUD route handlers for a simple model. Use in app/api/admin/<x>/route.ts and [id]/route.ts. */
export function crud({ model, schema, sort = { createdAt: -1 }, populate, hasSlug = true, validate, afterRemove, deltaField }: Opts) {
  const baseKey = deltaField ? `${deltaField}Base` : null;

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
      if (baseKey) delete data[baseKey];
      await validate?.(data);
      if (hasSlug) data.slug = data.slug ? await uniqueSlug(model, data.slug as string) : await uniqueSlug(model, data.name as string);
      return model.create(data);
    },
    { admin: true }
  );

  const update = api<Ctx>(
    async (req, { params }) => {
      const { id } = await params;
      checkId(id);
      const data = schema.parse(await req.json());
      const base = baseKey ? (data[baseKey] as number | undefined) : undefined;
      if (baseKey) delete data[baseKey];
      await validate?.(data, id);
      // Same normalisation as create, so a hand-typed slug can't contain spaces or slashes.
      if (hasSlug && data.slug) data.slug = await uniqueSlug(model, data.slug as string, id);
      if (hasSlug && !data.slug) delete data.slug;

      // Apply a stock edit as "+N / -N since the form loaded" so sales made meanwhile aren't overwritten.
      const filter: Record<string, unknown> = { _id: id };
      const inc: Record<string, number> = {};
      if (deltaField && base != null && typeof data[deltaField] === "number") {
        const delta = (data[deltaField] as number) - base;
        delete data[deltaField];
        if (delta !== 0) {
          inc[deltaField] = delta;
          if (delta < 0) filter[deltaField] = { $gte: -delta };
        }
      }

      // Fields missing from the parsed body were blanked in the form: unset them.
      const unset: Record<string, 1> = {};
      for (const key of Object.keys(model.schema.paths)) {
        if (["_id", "__v", "createdAt", "updatedAt", "slug"].includes(key) || key.includes(".")) continue;
        if (!(key in data) && key !== deltaField && key in (schemaShapeKeys(schema) ?? {})) unset[key] = 1;
      }
      const doc = await model.findOneAndUpdate(
        filter,
        { $set: data, ...(Object.keys(inc).length ? { $inc: inc } : {}), ...(Object.keys(unset).length ? { $unset: unset } : {}) },
        { returnDocument: "after", runValidators: true }
      );
      if (!doc) {
        if (Object.keys(inc).length && (await model.exists({ _id: id }))) throw new HttpError(409, "Stock changed while you were editing. Reload the product and try again.");
        throw new HttpError(404, "Not found");
      }
      return doc;
    },
    { admin: true }
  );

  const remove = api<Ctx>(
    async (_req, { params }) => {
      const { id } = await params;
      checkId(id);
      await model.findByIdAndDelete(id);
      await afterRemove?.(id);
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
