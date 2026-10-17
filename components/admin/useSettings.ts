"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/components/admin/ui";

export type SettingsForm = {
  storeName: string;
  contactPhone?: string;
  contactEmail?: string;
  announcementEnabled: boolean;
  announcementText?: string;
  shippingFee: number;
  freeShippingThreshold: number;
  bankDetails?: string;
  defaultLowStock: number;
  homeSections: { id: "categories" | "featured" | "sale" | "bundles" | "trust" | "reviews"; enabled: boolean; title: string }[];
  trustItems: { icon: string; title: string; text?: string }[];
  saleCountdownEnd?: string;
};

export function useSettings() {
  const [settings, setSettings] = useState<SettingsForm | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminFetch<SettingsForm>("/api/admin/settings").then(setSettings).catch((e) => setError(e.message));
  }, []);

  async function save() {
    if (!settings) return;
    setError("");
    setSaved(false);
    try {
      setSettings(await adminFetch<SettingsForm>("/api/admin/settings", "PUT", settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return { settings, setSettings, save, error, saved };
}
