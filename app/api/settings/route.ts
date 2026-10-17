import { api } from "@/lib/api";
import { getSettings } from "@/lib/models/Settings";

// Public subset of settings needed by checkout.
export const GET = api(async () => {
  const s = await getSettings();
  return { shippingFee: s.shippingFee, freeShippingThreshold: s.freeShippingThreshold, bankDetails: s.bankDetails ?? "" };
});
