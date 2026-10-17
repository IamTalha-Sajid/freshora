import { deleteModel, model, models, type Model, type Schema } from "mongoose";

/**
 * Register a model. In development the cached model is dropped first so schema edits
 * take effect on hot reload instead of silently keeping the old schema.
 */
export function defineModel<T>(name: string, schema: Schema<T>): Model<T> {
  if (process.env.NODE_ENV !== "production" && models[name]) deleteModel(name);
  return (models[name] as Model<T> | undefined) ?? model<T>(name, schema);
}
