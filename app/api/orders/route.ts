import { api, HttpError } from "@/lib/api";
import { Bundle } from "@/lib/models/Bundle";
import { Order, type IOrderItem } from "@/lib/models/Order";
import { Product } from "@/lib/models/Product";
import { getSettings } from "@/lib/models/Settings";
import { effectivePrice, shippingFor } from "@/lib/pricing";
import { checkoutSchema } from "@/lib/schemas";

const round2 = (n: number) => Math.round(n * 100) / 100;

function orderNumber() {
  return `FR-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

export const POST = api(async (req) => {
  const body = checkoutSchema.parse(await req.json());
  if (body.paymentMethod === "bank" && !body.paymentReference) throw new HttpError(400, "Enter your bank transfer reference");

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
    if (!p) throw new HttpError(400, "A product in your cart is no longer available");
    lines.push({ product: p._id, name: p.name, price: effectivePrice(p), qty: it.qty, image: p.images[0] });
    add(it.id, it.qty);
  }
  for (const it of body.items.filter((i) => i.kind === "bundle")) {
    const b = bundles.find((x) => String(x._id) === it.id);
    if (!b) throw new HttpError(400, "A bundle in your cart is no longer available");
    const parts = b.items.map((bi) => {
      const p = products.get(String(bi.product));
      if (!p) throw new HttpError(400, `Bundle "${b.name}" contains an unavailable product`);
      return { p, qty: bi.qty, eff: effectivePrice(p) };
    });
    const total = parts.reduce((s, x) => s + x.eff * x.qty, 0) || 1;
    for (const x of parts) {
      // Spread the bundle price across its products in proportion to their prices.
      lines.push({ product: x.p._id, name: `${x.p.name} (${b.name})`, price: round2((b.price * x.eff) / total), qty: x.qty * it.qty, image: x.p.images[0] });
      add(String(x.p._id), x.qty * it.qty);
    }
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
    const order = await Order.create({
      orderNumber: orderNumber(),
      items: lines,
      customer: body.customer,
      paymentMethod: body.paymentMethod,
      paymentReference: body.paymentReference,
      subtotal,
      shipping,
      total: round2(subtotal + shipping),
    });
    return { orderNumber: order.orderNumber };
  } catch (e) {
    await Promise.all(reserved.map(([id, qty]) => Product.findByIdAndUpdate(id, { $inc: { stock: qty } })));
    throw e;
  }
});
