import { api } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { uploadImage } from "@/lib/upload-image";

// Public: customers attach photos to reviews. Rate limited per IP since anyone can call it.
export const POST = api(async (req) => {
  rateLimit(`review-upload:${clientIp(req)}`, 20, 60 * 60_000);
  return { url: await uploadImage((await req.formData()).get("file")) };
});
