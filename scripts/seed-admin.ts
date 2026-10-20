import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Admin } from "../lib/models/Admin";
import { Settings } from "../lib/models/Settings";

async function main() {
  const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error("Set MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD in .env.local");
  await mongoose.connect(MONGODB_URI);
  if (ADMIN_PASSWORD.length < 10 || /^change-me/i.test(ADMIN_PASSWORD)) throw new Error("ADMIN_PASSWORD must be at least 10 characters and not the example value");
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await Admin.findOneAndUpdate({ email: ADMIN_EMAIL.toLowerCase() }, { passwordHash }, { upsert: true });
  await Settings.findOneAndUpdate({ key: "main" }, { $setOnInsert: { key: "main" } }, { upsert: true });
  console.log(`Admin ready: ${ADMIN_EMAIL}`);
  await mongoose.disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
