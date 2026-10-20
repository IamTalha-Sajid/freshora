import Link from "next/link";
import type { CSSProperties } from "react";
import { Logo } from "@/components/Brand";
import { StoreChrome } from "@/components/StoreChrome";
import { getCategories, getFeaturedProducts } from "@/lib/data";
import { getSettings } from "@/lib/models/Settings";

// All storefront pages read live data from MongoDB.
export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const [settings, categories, upsell] = await Promise.all([getSettings(), getCategories(), getFeaturedProducts(6)]);
  const roots = categories.filter((c) => !c.parent).slice(0, 6);
  const announcement = settings.announcementEnabled && !!settings.announcementText;

  return (
    <div className="relative flex flex-1 flex-col" style={{ "--hdr-pad": announcement ? "132px" : "96px" } as CSSProperties}>
      {announcement && (
        <div className="absolute inset-x-0 top-0 z-[45] flex h-9 items-center justify-center bg-gradient-to-r from-navy via-teal to-navy px-4 text-center text-xs font-semibold text-white sm:text-sm">
          {settings.announcementText}
        </div>
      )}
      <StoreChrome categories={categories} shipping={{ fee: settings.shippingFee, threshold: settings.freeShippingThreshold }} upsell={upsell} announcement={announcement} />

      <main className="flex-1 pt-[var(--hdr-pad)]">{children}</main>

      <footer className="mt-28 bg-[#06141b] pb-28 text-[#e6f4f2] md:pb-0">
        <div className="container-x grid gap-10 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-3">
            <Logo className="h-9" onDark />
            <p className="max-w-xs text-sm text-[#9db9bf]">Dental and oral-care essentials, delivered to your door.</p>
          </div>
          <div>
            <h3 className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#9db9bf]">Shop</h3>
            <ul className="text-sm">
              <li>
                <Link href="/shop" className="-mx-2 inline-flex min-h-11 items-center px-2 hover:text-[#4fd3c4]">
                  All products
                </Link>
              </li>
              {roots.map((c) => (
                <li key={c._id}>
                  <Link href={`/category/${c.slug}`} className="-mx-2 inline-flex min-h-11 items-center px-2 hover:text-[#4fd3c4]">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#9db9bf]">Help</h3>
            <ul className="text-sm">
              <li>
                <Link href="/track" className="-mx-2 inline-flex min-h-11 items-center px-2 hover:text-[#4fd3c4]">
                  Track your order
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="-mx-2 inline-flex min-h-11 items-center px-2 hover:text-[#4fd3c4]">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/cart" className="-mx-2 inline-flex min-h-11 items-center px-2 hover:text-[#4fd3c4]">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#9db9bf]">Contact</h3>
            <ul className="text-sm">
              {settings.contactPhone && <li>{settings.contactPhone}</li>}
              {settings.contactEmail && (
                <li>
                  <a href={`mailto:${settings.contactEmail}`} className="-mx-2 inline-flex min-h-11 items-center px-2 hover:text-[#4fd3c4]">
                    {settings.contactEmail}
                  </a>
                </li>
              )}
              {!settings.contactPhone && !settings.contactEmail && <li className="text-[#9db9bf]">Add contact details in admin settings.</li>}
            </ul>
          </div>
        </div>
        <div className="container-x border-t border-[#1e3c4b] py-5 text-xs text-[#9db9bf]">
          © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
