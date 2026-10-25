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

/** A quantity deal on a product: `qty` units for `price` in total ("2 for Rs. 800"). */
export type Offer = { qty: number; price: number; label?: string; best?: boolean };

/** Offers that really beat buying single units, cheapest per unit first. */
export function usableOffers(unit: number, offers?: Offer[] | null): Offer[] {
  return (offers ?? []).filter((o) => o.qty >= 2 && o.price > 0 && o.price < unit * o.qty).sort((a, b) => a.price / a.qty - b.price / b.qty);
}

/** Splits `qty` units into whole offer packs (best deal first) and single units, and totals the price. */
export function splitByOffers(unit: number, offers: Offer[] | null | undefined, qty: number) {
  let left = qty;
  const packs: { offer: Offer; count: number }[] = [];
  let total = 0;
  for (const offer of usableOffers(unit, offers)) {
    const count = Math.floor(left / offer.qty);
    if (count > 0) {
      packs.push({ offer, count });
      total += count * offer.price;
      left -= count * offer.qty;
    }
  }
  return { packs, singles: left, total: total + left * unit };
}

/** What a cart line costs, with any quantity offers applied. */
export function lineTotal(l: { price: number; qty: number; offers?: Offer[] | null }) {
  return splitByOffers(l.price, l.offers, l.qty).total;
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
