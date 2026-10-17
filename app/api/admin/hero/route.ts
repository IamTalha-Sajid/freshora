import { crud } from "@/lib/crud";
import { HeroSlide } from "@/lib/models/HeroSlide";
import { heroSchema } from "@/lib/schemas";

const c = crud({ model: HeroSlide, schema: heroSchema, sort: { order: 1 }, hasSlug: false });
export const GET = c.list;
export const POST = c.create;
