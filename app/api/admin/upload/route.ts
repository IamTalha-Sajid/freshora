import { v2 as cloudinary } from "cloudinary";
import { api, HttpError } from "@/lib/api";

export const POST = api(
  async (req) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) throw new HttpError(500, "Cloudinary is not configured");
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const file = (await req.formData()).get("file");
    if (!(file instanceof File)) throw new HttpError(400, "No file");
    if (!["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"].includes(file.type)) throw new HttpError(400, "Use a JPG, PNG, WebP, GIF or AVIF image");
    if (file.size > 4 * 1024 * 1024) throw new HttpError(400, "Max 4MB (Vercel body limit)");
    const buf = Buffer.from(await file.arrayBuffer());
    // The declared type is browser-supplied, so check the file's own signature too.
    const sig = buf.subarray(0, 12).toString("latin1");
    const okSig = sig.startsWith("ÿØÿ") || sig.startsWith("PNG") || sig.startsWith("GIF8") || (sig.startsWith("RIFF") && sig.slice(8, 12) === "WEBP") || sig.slice(4, 8) === "ftyp";
    if (!okSig) throw new HttpError(400, "That file is not a valid image");
    const result = await new Promise<{ secure_url: string }>((resolve, reject) =>
      cloudinary.uploader.upload_stream({ folder: "freshora", resource_type: "image" }, (err, r) => (err || !r ? reject(err) : resolve(r))).end(buf)
    );
    return { url: result.secure_url };
  },
  { admin: true }
);
