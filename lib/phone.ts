/** Canonical form for comparing phone numbers: digits only, Pakistani "+92 3xx" and "03xx" treated alike. */
export function normalizePhone(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("92") && d.length >= 12) d = d.slice(2);
  return d.replace(/^0+/, "");
}
