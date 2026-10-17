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
    if (!file.type.startsWith("image/")) throw new HttpError(400, "Images only");
    if (file.size > 4 * 1024 * 1024) throw new HttpError(400, "Max 4MB (Vercel body limit)");
    const buf = Buffer.from(await file.arrayBuffer());
    const result = await new Promise<{ secure_url: string }>((resolve, reject) =>
      cloudinary.uploader.upload_stream({ folder: "freshora" }, (err, r) => (err || !r ? reject(err) : resolve(r))).end(buf)
    );
    return { url: result.secure_url };
  },
  { admin: true }
);
