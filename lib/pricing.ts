export type SaleFields = { price: number; salePrice?: number | null; saleStart?: Date | string | null; saleEnd?: Date | string | null };

export function isOnSale(p: SaleFields, now = new Date()) {
  if (p.salePrice == null || p.salePrice >= p.price) return false;
  if (p.saleStart && new Date(p.saleStart) > now) return false;
  if (p.saleEnd && new Date(p.saleEnd) < now) return false;
  return true;
}

export function effectivePrice(p: SaleFields, now = new Date()) {
  return isOnSale(p, now) ? (p.salePrice as number) : p.price;
}

export function formatPKR(n: number) {
  return `Rs. ${Math.round(n).toLocaleString("en-PK")}`;
}

export function shippingFor(subtotal: number, fee: number, freeThreshold: number) {
  return freeThreshold > 0 && subtotal >= freeThreshold ? 0 : fee;
}

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
