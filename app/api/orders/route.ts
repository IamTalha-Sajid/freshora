import { api, HttpError } from "@/lib/api";
import { Bundle } from "@/lib/models/Bundle";
import { Order, type IOrderItem } from "@/lib/models/Order";
import { Product } from "@/lib/models/Product";
import { getSettings } from "@/lib/models/Settings";
import { notifyNewOrder } from "@/lib/notify";
import { newOrderNumber } from "@/lib/order-number";
import { normalizePhone } from "@/lib/phone";
import { effectivePrice, formatPKR, shippingFor, splitByOffers } from "@/lib/pricing";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { checkoutSchema } from "@/lib/schemas";

const round2 = (n: number) => Math.round(n * 100) / 100;

// Cash on delivery reserves stock before any money moves, so cap how much one phone number can hold.
const MAX_OPEN_ORDERS_PER_PHONE = 3;
const MAX_ORDERS_PER_DAY_PER_PHONE = 6;

export const POST = api(async (req) => {
  rateLimit(`order:ip:${clientIp(req)}`, 8, 10 * 60_000);
  const body = checkoutSchema.parse(await req.json());
  if (body.website) throw new HttpError(400, "Could not place order"); // honeypot tripped
  if (body.paymentMethod === "bank" && !body.paymentReference) throw new HttpError(400, "Enter your bank transfer reference");

  // Count this phone's orders however it was typed (0300…, +92 300…): match on the last 10 digits.
  const tail = normalizePhone(body.customer.phone).slice(-10);
  const phoneRx = new RegExp(`${tail.split("").join("\\D*")}\\D*$`);
  const since = new Date(Date.now() - 24 * 3600_000);
  const [open, today] = await Promise.all([
    Order.countDocuments({ "customer.phone": phoneRx, status: "pending" }),
    Order.countDocuments({ "customer.phone": phoneRx, createdAt: { $gte: since } }),
  ]);
  if (open >= MAX_OPEN_ORDERS_PER_PHONE || today >= MAX_ORDERS_PER_DAY_PER_PHONE)
    throw new HttpError(429, "Orders for this phone number are already awaiting confirmation. Wait for them to be processed, or contact us.");

  // Build line items from the DB; client-sent prices are never trusted.
  const want = new Map<string, number>(); // productId -> qty
  const lines: IOrderItem[] = [];
  const add = (id: string, qty: number) => want.set(id, (want.get(id) ?? 0) + qty);

  const productIds = body.items.filter((i) => i.kind === "product").map((i) => i.id);
  const bundleIds = body.items.filter((i) => i.kind === "bundle").map((i) => i.id);
  const bundles = await Bundle.find({ _id: { $in: bundleIds }, active: true }).lean();
  const needIds = new Set([...productIds, ...bundles.flatMap((b) => b.items.map((i) => String(i.product)))]);
  const products = new Map((await Product.find({ _id: { $in: [...needIds] }, active: true }).lean()).map((p) => [String(p._id), p]));

  for (const it of body.items.filter((i) => i.kind === "product")) {
    const p = products.get(it.id);
    if (!p) throw new HttpError(400, "A product in your cart is no longer available. Refresh your cart and try again.");
    // Quantity offers become their own order lines ("3 for Rs. 1,100" x 1), so every line is still price x qty.
    const unit = effectivePrice(p);
    const { packs, singles } = splitByOffers(unit, p.offers, it.qty);
    for (const { offer, count } of packs) lines.push({ product: p._id, name: `${p.name} (${offer.qty} for ${formatPKR(offer.price)})`, price: offer.price, qty: count, image: p.images[0] });
    if (singles > 0) lines.push({ product: p._id, name: p.name, price: unit, qty: singles, image: p.images[0] });
    add(it.id, it.qty);
  }
  for (const it of body.items.filter((i) => i.kind === "bundle")) {
    const b = bundles.find((x) => String(x._id) === it.id);
    if (!b) throw new HttpError(400, "A bundle in your cart is no longer available. Refresh your cart and try again.");
    const parts = b.items.map((bi) => {
      const p = products.get(String(bi.product));
      if (!p) throw new HttpError(400, `Bundle "${b.name}" contains an unavailable product`);
      return { p, qty: bi.qty, eff: effectivePrice(p) };
    });
    // Spread the bundle price across its products in proportion to their prices, in whole paisa. Whatever
    // rounding leaves over goes on one extra line, so each bundle adds up to exactly its price.
    const weight = parts.reduce((s, x) => s + x.eff * x.qty, 0) || 1;
    const bundleCents = Math.round(b.price * 100);
    const unitCents = parts.map((x) => Math.floor((bundleCents * x.eff) / weight));
    const leftover = bundleCents - parts.reduce((s, x, i) => s + unitCents[i] * x.qty, 0);
    parts.forEach((x, i) => {
      lines.push({ product: x.p._id, name: `${x.p.name} (${b.name})`, price: unitCents[i] / 100, qty: x.qty * it.qty, image: x.p.images[0] });
      add(String(x.p._id), x.qty * it.qty);
    });
    if (leftover > 0) lines.push({ product: parts[0].p._id, name: `${b.name} (rounding)`, price: leftover / 100, qty: it.qty, image: parts[0].p.images[0] });
  }

  // Atomically reserve stock; roll back on any shortfall.
  const reserved: [string, number][] = [];
  try {
    for (const [id, qty] of want) {
      const ok = await Product.findOneAndUpdate({ _id: id, stock: { $gte: qty } }, { $inc: { stock: -qty } });
      if (!ok) throw new HttpError(409, `Not enough stock for "${products.get(id)?.name}"`);
      reserved.push([id, qty]);
    }
    const settings = await getSettings();
    const subtotal = round2(lines.reduce((s, l) => s + l.price * l.qty, 0));
    const shipping = shippingFor(subtotal, settings.shippingFee, settings.freeShippingThreshold);
    let order;
    for (let attempt = 0; ; attempt++) {
      try {
        order = await Order.create({
          orderNumber: newOrderNumber(),
          items: lines,
          customer: body.customer,
          paymentMethod: body.paymentMethod,
          paymentReference: body.paymentReference,
          subtotal,
          shipping,
          total: round2(subtotal + shipping),
        });
        break;
      } catch (e) {
        if ((e as { code?: number }).code !== 11000 || attempt >= 2) throw e; // order-number collision: retry
      }
    }
    // Fire and forget: a mail problem must never fail a placed order.
    void notifyNewOrder(order, settings.contactEmail);
    return { orderNumber: order.orderNumber };
  } catch (e) {
    await Promise.all(reserved.map(([id, qty]) => Product.findByIdAndUpdate(id, { $inc: { stock: qty } })));
    throw e;
  }
});
