import { api } from "@/lib/api";
import { Subscriber } from "@/lib/models/Subscriber";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { newsletterSchema } from "@/lib/schemas";

export const POST = api(async (req) => {
  rateLimit(`newsletter:${clientIp(req)}`, 5, 60 * 60_000);
  const { email } = newsletterSchema.parse(await req.json());
  // Idempotent: signing up twice is not an error, and the response never reveals who is already subscribed.
  await Subscriber.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true });
  return { ok: true };
});
