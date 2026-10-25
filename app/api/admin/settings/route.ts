import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";
import { Settings, getSettings } from "@/lib/models/Settings";
import { settingsSchema } from "@/lib/schemas";

export const GET = api(async () => getSettings(), { admin: true });

export const PUT = api(
  async (req) => {
    const data = settingsSchema.parse(await req.json());
    const unset = (["contactPhone", "contactEmail", "announcementText", "bankDetails", "saleCountdownEnd", "whyImage"] as const).filter((k) => data[k] === undefined);
    await Settings.findOneAndUpdate(
      { key: "main" },
      { $set: data, ...(unset.length ? { $unset: Object.fromEntries(unset.map((k) => [k, 1])) } : {}) },
      { upsert: true }
    );
    revalidatePath("/", "layout");
    return getSettings(); // includes defaults for fields never saved
  },
  { admin: true }
);
