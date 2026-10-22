import { api } from "@/lib/api";
import { uploadImage } from "@/lib/upload-image";

export const POST = api(async (req) => ({ url: await uploadImage((await req.formData()).get("file")) }), { admin: true });
