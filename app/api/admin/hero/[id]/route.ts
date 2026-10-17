import { crud } from "@/lib/crud";
import { HeroSlide } from "@/lib/models/HeroSlide";
import { heroSchema } from "@/lib/schemas";

const c = crud({ model: HeroSlide, schema: heroSchema, hasSlug: false });
export const PUT = c.update;
export const DELETE = c.remove;
